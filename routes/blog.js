const { Router } = require("express");
const router = Router();

// Render the blog form
router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user: req.user,  // ✅ req.user, not res.user
    });
});


router.post('/', (req, res) => {
    console.log(req.body);
    return res.redirect("/");
});


module.exports = router; // ✅ this was wrong earlier (you wrote module.export)
