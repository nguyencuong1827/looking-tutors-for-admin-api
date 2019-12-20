var express = require('express');
var router = express.Router();
var manager_controller = require ('../controllers/api/manager-controller');
const passport = require('passport');
router.use(passport.initialize());


router.post('/register', manager_controller.manager_register_process);

router.post('/login' ,manager_controller.manager_login_process);

router.get('/me', manager_controller.manager_info);

router.put('/update', manager_controller.update_info);

router.put('/changePassword', manager_controller.change_password);

router.post('/upload', manager_controller.upload);

module.exports = router;
