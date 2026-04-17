const express = require('express');
const {getUsers, updateUser, deleteUser}=require('../controllers/users');

const router=express.Router();

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect,authorize('admin','PomPhet'),getUsers);
router.route('/:id').put(protect,authorize('PomPhet'),updateUser).delete(protect,authorize('PomPhet'),deleteUser);

module.exports=router;