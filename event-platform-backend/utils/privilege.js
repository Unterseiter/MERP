const { Admin } = require('../models');

async function Check_Privilege(event, user){
    // Check if the user is an admin
    const admin_cheked = await Admin.findByPk(user);
    if(!admin_cheked) return false;

    if(event !== user){
        return false;
    }
    return true;
}
module.exports = Check_Privilege;