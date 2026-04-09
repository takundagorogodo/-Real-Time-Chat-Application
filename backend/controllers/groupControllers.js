import Group from "../models/Group.js";


export const createGroup  = async (req,res)=>{
    try {
        const {name,description,members ,isPrivate} = req.body;

        if(!name||!description||!members||!isPrivate){
            return res.status(404).json({
                message:"all fieids reqired",
                success :false
            });
        }

        const group = await Group.create({
            name,
            description,
            admin:req.user._id,
            members:[...new Set([...Group(members || []), req.user._id.toString])],

        });
     await group.populate("members","username avator");
     await group.populate("admin","username avator");
     res.status(201).json({
        success:true,
        message:"group creation succesfully"
     },
    group
);

    } catch (error) {
        res.status(500).json({
            message:error.message,
            success:false
        })
    }
}

export const getAllGroupsUser = async(req,res)=>{
     try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "username avatar")
      .populate("admin", "username avatar")
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getSinngleGroup = async(req,res)=>{
    try {
    const group = await Group.findById(req.params.id)
      .populate("members", "username avatar")
      .populate("admin", "username avatar");
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.find((m) => m._id.equals(req.user._id)))
      return res.status(403).json({ message: "Not a member" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const addMember = async(req,res)=>{
    try {
    const group = await Group.findById(req.params.id);
    if (!group.admin.equals(req.user._id))
      return res.status(403).json({ message: "Only admin can add members" });
    const { userId } = req.body;
    if (group.members.includes(userId))
      return res.status(400).json({ message: "User already a member" });
    group.members.push(userId);
    await group.save();
    await group.populate("members", "username avatar");
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const removeMember = async(req,res)=>{
    try {
    const group = await Group.findById(req.params.id);
    if (!group.admin.equals(req.user._id))
      return res.status(403).json({ message: "Only admin can remove members" });
    if (req.params.userId === group.admin.toString())
      return res.status(400).json({ message: "Cannot remove admin" });
    group.members = group.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await group.save();
    await group.populate("members", "username avatar");
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const leaveGroup = async (req,res)=>{
     try {
    const group = await Group.findById(req.params.id);
    if (group.admin.equals(req.user._id))
      return res.status(400).json({ message: "Admin must transfer or delete group before leaving" });
    group.members = group.members.filter((m) => !m.equals(req.user._id));
    await group.save();
    res.json({ message: "Left group" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const deleteGroup = async(req,res)=>{
     try {
    const group = await Group.findById(req.params.id);
    if (!group.admin.equals(req.user._id))
      return res.status(403).json({ message: "Only admin can delete group" });
    await GroupMessage.deleteMany({ group: req.params.id });
    await group.deleteOne();
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getMessage = async(req,res)=>{
     const { page = 1, limit = 50 } = req.query;
  try {
    const group = await Group.findById(req.params.id);
    if (!group.members.find((m) => m.equals(req.user._id)))
      return res.status(403).json({ message: "Not a member" });
    const messages = await GroupMessage.find({ group: req.params.id })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}