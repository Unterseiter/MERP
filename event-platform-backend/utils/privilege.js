const { User } = require('../models');

async function Check_Privilege(event, user){
    // Check if the user is an admin
    console.log("privilege");
    console.log(user);
    console.log(event);
    const admin_cheked = await User.scope('withoutPassword').findOne({ where: { tag_name: user, privilege : "admin"} });
    if(!admin_cheked) return false;

    if(event !== user){
        return false;
    }
    return true;
}
module.exports = Check_Privilege;