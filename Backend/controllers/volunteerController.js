const Volunteer = require('../models/volunteer');
const Event = require('../models/Events');

// Get all volunteers
const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.aggregate([
      {
        $lookup: {
          from: 'events',
          let: { volunteerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$$volunteerId',
                    {
                      $map: {
                        input: '$participants',
                        as: 'participant',
                        in: '$$participant.volunteerId'
                      }
                    }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                title: 1,
                date: 1,
                status: 1,
                location: 1,
                description: 1
              }
            }
          ],
          as: 'events'
        }
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          name: 1,
          email: 1,
          phone: 1,
          city: 1,
          preferredArea: 1,
          availability: 1,
          hasVolunteered: 1,
          pastExperience: 1,
          skills: 1,
          motivation: 1,
          emergencyContact: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          events: 1
        }
      }
    ]);

    res.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ message: 'Error fetching volunteers' });
  }
};

// Approve volunteer
const approveVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { 
        status: 'approved',
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    res.json(volunteer);
  } catch (error) {
    console.error('Error approving volunteer:', error);
    res.status(500).json({ message: 'Error approving volunteer' });
  }
};

// Reject volunteer
const rejectVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    res.json(volunteer);
  } catch (error) {
    console.error('Error rejecting volunteer:', error);
    res.status(500).json({ message: 'Error rejecting volunteer' });
  }
};

module.exports = {
  getAllVolunteers,
  approveVolunteer,
  rejectVolunteer
}; 