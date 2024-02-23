



const getDateFormat = async () => {
    return (moment().format('YYYY-MM-DD HH:mm:ss'))
}
const deleteFromMember = async (data) => {
    delete data.password
    delete data.pin
    return (data)
}
module.exports = {
    getDateFormat, deleteFromMember
} 