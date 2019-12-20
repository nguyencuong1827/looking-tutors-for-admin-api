//const bcrypt = require('bcryptjs');
// const admin = require('firebase-admin');
// const serviceAccount = require('../config-firebase/config-firebase.json');
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// })

// const db = admin.firestore();
// const checkExist =  async (username) => {
//     var result = await db.collection("managers").doc(username).get();
//     if(result.exists === false){
//         return false;
//     }
//     return result.data();
    
// }
// const addmanager = async (manager) => {   
//     const newmanager = manager
//     bcrypt.genSalt(10, function (err, salt) {
//       bcrypt.hash(newmanager.password, salt, function (err, hash) {
//         if (err) {
//           console.log(err);
//         }
//         newmanager.password = hash;
//         db.collection("managers").doc(newmanager.username).set({
//             fullName: newmanager.fullName,
//             username: newmanager.username,
//             password: newmanager.password
//         })
//         .catch(function(error) {
//             if(error){
//                 return false
//             }
//             return true;
//         });
//       });
//     });
// }

// const validPassword = async (username, password) => {
//     const manager = await checkExist(username);
//     console.log(manager);
//     if (!manager)
//       return false;
//     return await bcrypt.compare(password, manager.password);
//     //return null;
//   };

// const updateInfo = async (username, managerWithoutusername, res) => {
//   const query = {'username': username};
//   await db.collection("managers").doc(username).update({
//     managerWithoutusername
//   })
//   .then(function() {
//     return res.status(200).json({
//         message: 'Cập nhập thông tin thành công'
//       });
//    })
//   .catch(function(error) {
//     return res.status(400).json({
//         error: err
//       });
//    });
// };


// const changePassword = async (username, password, newPassword, oldPassword, res) => {

//     const compare = await bcrypt.compare(oldPassword, password);
    
//     if(!compare){
//       return res.status(400).json({
//         message: 'Mật khẩu cũ không chính xác'
//       });
//     }
    
//     bcrypt.genSalt(10, function (err, salt) {
//         bcrypt.hash(newPassword, salt, async (err, hash) => {
//           if (err) {
//             return res.status(400).json({
//               error: err
//             });
//           }
//         await db.collection("managers").doc(username).update({
//             password: hash
//         })
//         .then(function() {
//             return res.status(200).json({
//                 message: 'Đổi mật khẩu thành công'
//             });
//         })
//         .catch(function(error) {
//             return res.status(400).json({
//                 error: err
//             });
//         });
//       });
//     });
//   };

// module.exports = {
//     db,
//     checkExist,
//     addmanager,
//     validPassword,
//     updateInfo,
//     changePassword,
// }

const bcrypt = require('bcryptjs');
const FileAPI = require('file-api');
const File = FileAPI.File;
const firebaseConfig = require('../config-firebase')
const firebase = require('firebase');
require('firebase/storage');
firebase.initializeApp(firebaseConfig);



const upload = (url, username) =>{
 
  const file = new File(url);
  console.log(file);
  // Create a root reference
  const storageRef = firebase.storage().ref();
  var fileBlob = URL.createObjectURL(url)
  // Create the file metadata
  const metadata = {
    contentType: 'image/*'
  };
  storageRef.child('images/' + username ).put(fileBlob, metadata);
}




const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var manager = new Schema({
  id: String,

  code:{
    type: String,
    default: ''
  },

  fullName:{
    type: String,
    required: true
  },

  username:{
    type: String,
    required: true
  },

  password:{
    type: String,
    required: true
  },

  role:{
    type: String,
    default: 'Nhân viên'
  },

  urlAvatar:{
    type: String,
    default: ''
  }
});

const list = mongoose.model('managers', manager);

const saveManager = async (manager) => {
  const newManager = new list(manager);
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newManager.password, salt, function (err, hash) {
      if (err) {
        console.log(err);
      }
  
      newManager.code = newManager.role === 'Chủ sở hữu' ? 'AD' + newManager._id: 'NV' + newManager._id;

      newManager.password = hash;
      newManager.save(function (err) {
        if (err) {
          console.log(err);
          return false;
        } else {
          return true;
        }
      });
    });
  });
};

const validPassword = async (username, password) => {
  const manager = await list.findOne({ 'username': username });
  if (!manager)
    return false;
  return await bcrypt.compare(password, manager.password);
};

const checkUsername = async (username) => {
  const manager = await list.findOne({ 'username': username });
  if (!manager)
    return false; 
  return true;
};

const updateInfo = async (username ,fullName, urlAvatar, res) => {
  const query = {'username': username};
  let set;
  if(urlAvatar === ''){
    set = { fullName: fullName}
  }
  else{
    set = { fullName: fullName, urlAvatar: urlAvatar}
  }

  await list.findOneAndUpdate(query, 
                              {$set: set}, 
                              {upsert: true}, 
                              function(err, doc){
                                if(err){
                                  return res.status(400).json({
                                    error: err
                                  });
                                }
                                return res.status(200).json({
                                  message: 'Cập nhập thông tin thành công'
                                });
  });
};

const changePassword = async (username, password, newPassword, oldPassword, res) => {
  const query = {'username': username};
  const compare = await bcrypt.compare(oldPassword, password);
  
  if(!compare){
    return res.status(400).json({
      message: 'Mật khẩu cũ không chính xác'
    });
  }
  
  bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(newPassword, salt, async (err, hash) => {
        if (err) {
          return res.status(400).json({
            error: err
          });
        }
      await list.findOneAndUpdate(query, 
        {$set: {password: hash}}, 
        {upsert: true}, 
        function(err, doc){
          if(err){
            return res.status(400).json({
              error: err
            });
          }
          return res.status(200).json({
            message: 'Đổi mật khẩu thành công'
          });
      });
    });
  });
};



module.exports = {
  list: list,
  saveManager: saveManager,
  validPassword: validPassword,
  checkUsername: checkUsername,
  updateInfo: updateInfo,
  changePassword: changePassword,
  upload: upload
};