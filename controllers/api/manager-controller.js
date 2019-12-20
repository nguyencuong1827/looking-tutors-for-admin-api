const ManagerModel = require("../../models/manager-model"),
  passport = require("passport"),
  jwt = require("jsonwebtoken");
const Busboy = require("busboy");
//Login process
exports.manager_login_process = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Vui lòng điền đủ thông tin"
    });
  }
  passport.authenticate(
    "local-login",
    { session: false },
    (err, manager, info) => {
      if (err || !manager) {
        console.log(err);
        return res.status(400).json({
          message: info ? info.message : "Đăng nhập không thành công"
        });
      }

      req.login(manager, { session: false }, err => {
        if (err) {
          return res.send(err);
        }
        const token = jwt.sign(
          { username: manager.username },
          process.env.TOKEN_SECRET
        );
        jwt;
        res.header("auth-token", token);
        return res.json({
          token,
          manager
        });
      });
    }
  )(req, res, next);
};

//Register process
exports.manager_register_process = async (req, res) => {
  const { fullName, username, password, role } = req.body;

  if (!username || !password || !fullName || !role) {
    return res.status(400).json({
      message: "Vui lòng điền đủ thông tin"
    });
  }

  if (await ManagerModel.checkUsername(username)) {
    return res.status(400).json({
      message: `Tài khoản ${username} đã tồn tại`
    });
  }

  let newManager = new ManagerModel.list({
    fullName: fullName,
    username: username,
    password: password,
    role: role,
    code: ''
  });
  

  if (ManagerModel.saveManager(newManager)) {
    return res.status(200).json({
      message: "Đăng ký thành công"
    });
  }
};

//Info of the manager who has just logged in
exports.manager_info = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, manager, info) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }

    if (info) {
      return res.status(400).json({
        message: info.message
      });
    } else {
      return res.status(200).json({
        code: manager.code,
        fullName: manager.fullName,
        nickName: manager.nickName,
        username: manager.username,
        role: manager.role
      });
    }
  })(req, res, next);
};

//Update info of manager
exports.update_info = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, manager, info) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }

    if (info) {
      return res.status(400).json({
        message: info.message
      });
    } else {
      const { fullName, urlAvatar } = req.body;
      if (!fullName) {
        return res.status(400).json({
          message: "Vui lòng điền đủ thông tin"
        });
      }
      ManagerModel.updateInfo(manager.username, fullName, urlAvatar ,res);
    }
  })(req, res, next);
};

//Change password of manager
exports.change_password = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, manager, info) => {
    if (err) {
      return res.status(400).json({
        error: err
      });
    }

    if (info) {
      return res.status(400).json({
        message: info.message
      });
    } else {
      const { newPassword, oldPassword } = req.body;
      console.log("old " + oldPassword);
      console.log("new " + newPassword);
      console.log(manager.username);
      if (!newPassword || !oldPassword) {
        return res.status(400).json({
          message: "Vui lòng điền đủ thông tin"
        });
      }
      ManagerModel.changePassword(
        manager.username,
        manager.password,
        newPassword,
        oldPassword,
        res
      );
    }
  })(req, res, next);
};

//upload avatar
exports.upload = async  (req, res) => {
  const { url, username } = req.body;

  console.log(url);
 ManagerModel.upload(url, username);

 return res.status(200).json({
    mess: "ok"
  });
};