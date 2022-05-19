const { Product } = require('../mongo-models');
const db = require('../models');
const { PRODUCT_TYPE } = require('../utils/server-constant');
const product = require('../models/product');
module.exports = async function (req, res) {
  const mongoproducts = await Product.find().lean();
  for (const product of mongoproducts) {
    if (!product.isPaid) {
      product.price = 0;
    }
    // product.description = JSON.stringify(product.description);
    product.web_url = product.name.toLowerCase().replaceAll(' ', '-');
    product.status = product.status ? '1' : '2';
    product.requirements = product.requirements?.join(',') || null;
    product.benefits = product.benefits?.join(',') || null;
    product.target_students = product.targetStudents?.join(',') || null;
    switch (product.type) {
      case 'notes':
        product.type = PRODUCT_TYPE.notes;
        break;
      case 'quiz':
        product.type = PRODUCT_TYPE.quiz;
        break;
      case 'bulk':
        product.type = PRODUCT_TYPE.bulk;
        break;
      case 'course':
        product.type = PRODUCT_TYPE.course;
        break;
      case 'test_series':
        product.type = PRODUCT_TYPE.test_series;
        break;
    }
    console.log(product);
    await db.sequelize.query(
      'insert into eduseeker.products (name, description, strikeprice, price, validity, web_url, status,requirements,target_students, benefits, learning, cover_image, type) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      {
        replacements: [
          product.name,
          product.description,
          product.strikeprice,
          product.price,
          product.validity,
          product.web_url,
          product.status,
          product.requirements,
          product.target_students,
          product.benefits,
          product.learning,
          product.cover_image,
          product.type,
        ],
        type: db.sequelize.QueryTypes.INSERT,
      }
    );
  }
};
