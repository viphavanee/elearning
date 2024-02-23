const func = require('../function/quiz')
router
    .route("/adminLogin")
    .post(async (req, res) => {
        try {
            let response = await func.adminLogin(req.body)
            res.status(200).json(response)
        } catch (error) {
            console.log(error)
            res.status(500).json({ 'error': error })
        }
    })


module.exports = router 