const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');

const index = async (req, res) => {
    try {
        const query = { ...req.query, deleted: false };
        if (query.createBy) {
            query.createBy = new mongoose.Types.ObjectId(query.createBy);
        }

        let result = await MeetingHistory.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'Contacts',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'attendesContacts'
                }
            },
            {
                $lookup: {
                    from: 'Leads',
                    localField: 'attendesLead',
                    foreignField: '_id',
                    as: 'attendesLeads'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
            { $match: { 'creator.deleted': false } },
            {
                $project: {
                    agenda: 1,
                    location: 1,
                    related: 1,
                    dateTime: 1,
                    notes: 1,
                    createBy: 1,
                    timestamp: 1,
                    deleted: 1,
                    attendesContacts: {
                        $map: {
                            input: '$attendesContacts',
                            as: 'contact',
                            in: {
                                _id: '$$contact._id',
                                name: { $concat: ['$$contact.title', ' ', '$$contact.firstName', ' ', '$$contact.lastName'] }
                            }
                        }
                    },
                    attendesLeads: {
                        $map: {
                            input: '$attendesLeads',
                            as: 'lead',
                            in: {
                                _id: '$$lead._id',
                                name: '$$lead.leadName'
                            }
                        }
                    },
                    creatorName: '$creator.username'
                }
            }
        ]);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const add = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy } = req.body;

        // Validate attendes IDs if provided
        if (attendes && attendes.length > 0) {
            const invalidAttendes = attendes.some(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidAttendes) {
                return res.status(400).json({ error: 'Invalid attendee ID provided' });
            }
        }

        // Validate attendesLead IDs if provided
        if (attendesLead && attendesLead.length > 0) {
            const invalidAttendesLead = attendesLead.some(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidAttendesLead) {
                return res.status(400).json({ error: 'Invalid lead attendee ID provided' });
            }
        }

        const meetingData = {
            agenda,
            location,
            related,
            dateTime,
            notes,
            createBy,
            timestamp: new Date()
        };

        if (attendes && attendes.length > 0) {
            meetingData.attendes = attendes;
        }
        if (attendesLead && attendesLead.length > 0) {
            meetingData.attendesLead = attendesLead;
        }

        const meeting = new MeetingHistory(meetingData);
        await meeting.save();
        res.status(200).json(meeting);
    } catch (error) {
        console.error('Failed to create meeting:', error);
        res.status(400).json({ error: 'Failed to create meeting', details: error.message });
    }
};

const view = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findOne({ _id: req.params.id });
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        const result = await MeetingHistory.aggregate([
            { $match: { _id: meeting._id } },
            {
                $lookup: {
                    from: 'Contacts',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'attendesContacts'
                }
            },
            {
                $lookup: {
                    from: 'Leads',
                    localField: 'attendesLead',
                    foreignField: '_id',
                    as: 'attendesLeads'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    agenda: 1,
                    location: 1,
                    related: 1,
                    dateTime: 1,
                    notes: 1,
                    createBy: 1,
                    timestamp: 1,
                    attendesContacts: {
                        $map: {
                            input: '$attendesContacts',
                            as: 'contact',
                            in: {
                                _id: '$$contact._id',
                                name: { $concat: ['$$contact.title', ' ', '$$contact.firstName', ' ', '$$contact.lastName'] }
                            }
                        }
                    },
                    attendesLeads: {
                        $map: {
                            input: '$attendesLeads',
                            as: 'lead',
                            in: {
                                _id: '$$lead._id',
                                name: '$$lead.leadName'
                            }
                        }
                    },
                    creatorName: '$creator.username'
                }
            }
        ]);

        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const edit = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes } = req.body;

        // Validate attendes IDs if provided
        if (attendes && attendes.length > 0) {
            const invalidAttendes = attendes.some(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidAttendes) {
                return res.status(400).json({ error: 'Invalid attendee ID provided' });
            }
        }

        // Validate attendesLead IDs if provided
        if (attendesLead && attendesLead.length > 0) {
            const invalidAttendesLead = attendesLead.some(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidAttendesLead) {
                return res.status(400).json({ error: 'Invalid lead attendee ID provided' });
            }
        }

        const updateData = {
            agenda,
            location,
            related,
            dateTime,
            notes
        };

        if (attendes) {
            updateData.attendes = attendes;
        }
        if (attendesLead) {
            updateData.attendesLead = attendesLead;
        }

        const result = await MeetingHistory.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateData },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Failed to update meeting:', error);
        res.status(400).json({ error: 'Failed to update meeting', details: error.message });
    }
};

const deleteOne = async (req, res) => {
    try {
        const result = await MeetingHistory.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { deleted: true } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
        console.error('Failed to delete meeting:', error);
        res.status(400).json({ error: 'Failed to delete meeting', details: error.message });
    }
};

const deleteMany = async (req, res) => {
    try {
        const meetingIds = req.body; // Array of meeting IDs to delete
        if (!Array.isArray(meetingIds)) {
            return res.status(400).json({ message: "Request body should be an array of meeting IDs" });
        }

        // Validate all IDs are valid MongoDB ObjectIDs
        const invalidIds = meetingIds.some(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds) {
            return res.status(400).json({ message: "Invalid meeting ID(s) provided" });
        }

        const result = await MeetingHistory.updateMany(
            { _id: { $in: meetingIds } },
            { $set: { deleted: true } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "No meetings found to delete" });
        }

        res.status(200).json({ 
            message: "Meetings deleted successfully", 
            deletedCount: result.modifiedCount 
        });
    } catch (error) {
        console.error('Failed to delete meetings:', error);
        res.status(500).json({ error: 'Failed to delete meetings', details: error.message });
    }
};

module.exports = { index, add, view, edit, deleteOne, deleteMany };