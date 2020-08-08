const axios = require('axios')
const fs = require('fs')

const quotes = async () => {
    return await axios.get('https://api.terhambar.com/qts/')
        .then(response => {
            if (response.status === 200) {
                return response.data.quotes;
            }
        })
        .catch(e => {
            console.log('API Errors : ' + e.message)
        })
}

const bucin = async () => {
    const filename = 'status.txt';
    const lines = await fs.readFileSync(filename).toString().split("\n")
    return lines[Math.floor(Math.random() * lines.length)]
}

module.exports.quotes = quotes
module.exports.bucin = bucin