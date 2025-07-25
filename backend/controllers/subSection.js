const Section = require('../models/section');
const SubSection = require('../models/subSection');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

// Promisify fs methods for async/await
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Helper function to get video duration (you might need to install ffprobe or similar)
const getVideoDuration = async (filePath) => {
    // For now, returning a placeholder duration
    // You can implement actual video duration extraction using ffprobe or similar
    return "00:00:00"; // placeholder
};

// Helper function to save file locally
const saveFileLocally = async (file, uploadDir = 'uploads') => {
    try {
        // Create uploads directory if it doesn't exist
        const uploadsPath = path.join(__dirname, '..', uploadDir);
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }

        // Generate unique filename to avoid conflicts
        const timestamp = Date.now();
        const originalName = file.name;
        const extension = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, extension);
        const uniqueFilename = `${nameWithoutExt}_${timestamp}${extension}`;
        
        // Full path for the file
        const filePath = path.join(uploadsPath, uniqueFilename);
        
        // Save file to local directory
        await writeFile(filePath, file.data);
        
        // Get video duration (implement based on your needs)
        const duration = await getVideoDuration(filePath);
        
        return {
            filename: uniqueFilename,
            path: filePath,
            url: `/uploads/${uniqueFilename}`, // URL for serving the file
            duration: duration,
            size: file.size,
            mimetype: file.mimetype
        };
    } catch (error) {
        throw new Error(`Error saving file: ${error.message}`);
    }
};

// Helper function to delete file locally
const deleteFileLocally = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            await unlink(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// ================ create SubSection ================
exports.createSubSection = async (req, res) => {
    try {
        // extract data
        const { title, description, sectionId } = req.body;

        // extract video file
        const videoFile = req.files.video;
        // console.log('videoFile ', videoFile)

        // validation
        if (!title || !description || !videoFile || !sectionId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // save video locally
        const videoFileDetails = await saveFileLocally(videoFile);

        // create entry in DB
        const SubSectionDetails = await SubSection.create({
            title,
            timeDuration: videoFileDetails.duration,
            description,
            videoUrl: videoFileDetails.url,
            videoPath: videoFileDetails.path, // Store local path for potential deletion
            videoFilename: videoFileDetails.filename
        });

        // link subsection id to section
        // Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection");

        // return response
        res.status(200).json({
            success: true,
            data: updatedSection,
            message: 'SubSection created successfully'
        });
    }
    catch (error) {
        console.log('Error while creating SubSection');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating SubSection'
        });
    }
};

// ================ Update SubSection ================
exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, subSectionId, title, description } = req.body;

        // validation
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'subSection ID is required to update'
            });
        }

        // find in DB
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // add data
        if (title) {
            subSection.title = title;
        }

        if (description) {
            subSection.description = description;
        }

        // handle video file upload
        if (req.files && req.files.videoFile !== undefined) {
            const video = req.files.videoFile;
            
            // Delete old video file if exists
            if (subSection.videoPath) {
                await deleteFileLocally(subSection.videoPath);
            }
            
            // Save new video file
            const uploadDetails = await saveFileLocally(video);
            subSection.videoUrl = uploadDetails.url;
            subSection.videoPath = uploadDetails.path;
            subSection.videoFilename = uploadDetails.filename;
            subSection.timeDuration = uploadDetails.duration;
        }

        // save data to DB
        await subSection.save();

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.json({
            success: true,
            data: updatedSection,
            message: "Section updated successfully",
        });
    }
    catch (error) {
        console.error('Error while updating the section');
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while updating the section",
        });
    }
};

// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;
        
        // Get subsection details before deletion to access file path
        const subSection = await SubSection.findById(subSectionId);
        
        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" });
        }

        // Delete associated video file from local storage
        if (subSection.videoPath) {
            await deleteFileLocally(subSection.videoPath);
        }

        // Remove subsection reference from section
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        );

        // Delete subsection from DB
        await SubSection.findByIdAndDelete({ _id: subSectionId });

        const updatedSection = await Section.findById(sectionId).populate('subSection');

        // In frontend we have to take care - when subsection is deleted we are sending,
        // only section data not full course details as we do in others 

        // success response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "An error occurred while deleting the SubSection",
        });
    }
};