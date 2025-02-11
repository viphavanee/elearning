
const { v4: uuidv4 } = require('uuid')
const getRunnumber = async (name) => {
    try {
        return (`${name}${moment().format('YYYYMMDD')}-${(((uuidv4()).toString()).padStart(10, '0'))}`)
    } catch (error) {
        console.error(error)
        return (`${name}${moment().format('YYYYMMDD')}-${(((uuidv4()).toString()).padStart(10, '0'))}`)
    }
}
module.exports = {
    getRunnumber
}