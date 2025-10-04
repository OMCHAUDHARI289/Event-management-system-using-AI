import Member from '../models/Member.js';

// Admin adds a new club member
const addMember = async (req, res) => {
  try {
    const { name, email, phone, department, club } = req.body;

    const memberExists = await Member.findOne({ email });
    if (memberExists) {
      return res.status(400).json({ message: 'Member with this email already exists' });
    }

    const newMember = await Member.create({
      name,
      email,
      phone,
      department,
      club
    });

    res.status(201).json({ message: 'Member created successfully', member: newMember });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create member', error: error.message });
  }
};

// Admin views members branch-wise
const getMembersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const members = await Member.find({ department });
    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch members', error: error.message });
  }
};

export default { addMember, getMembersByDepartment };
