var express = require('express');
var router = express.Router();
const multer = require('multer');

const productController = require('../controllers/product.controller');

// limit file size to 10mb
router.post('/videoslide/create', multer({ limits: { fieldSize: 10 * 1024 * 1024 }}).none(), productController.index);

module.exports = router;
