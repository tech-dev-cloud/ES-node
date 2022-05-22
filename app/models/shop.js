const { ProductService } = require('../services/product');
const { config } = require('../../config/config');
const Mongoose = require('mongoose');
const params = require(`../../config/env/${config.NODE_ENV}_params.json`);

class Product {
  constructor(obj) {
    this._id = Mongoose.Types.ObjectId(obj._id);
    this.name = obj.name;
    this.heading = obj.heading;
    this.strikeprice = obj.strikeprice;
    this.price = obj.price;
    this.isPaid = obj.isPaid;
    this.description = obj.description;
    this.requirements = obj.requirements;
    this.benefits = obj.benefits;
    this.targetStudents = obj.targetStudents;
    this.learning = obj.learning;
    this.cover_image = obj.cover_image;
    this.promo_video_url = obj.promo_video_url;
    this.type = obj.type; // 1->PDF/notes/e-books, 2->quiz, 3->Bulk Pack, 4-> course
    this.priority = obj.priority;
    this.similar_products = obj.similar_products;
    this.isDraft = obj.isDraft;
    this.status = obj.status;
    this.validity = obj.validity;
    this.isPublish = obj.isPublish;
    this.discountPrice = obj.discountPrice;
    this.product_meta = obj.product_meta;
    this.created_by = obj.created_by;
    this.sub_products = obj.sub_products;
    this.discountPercent = obj.discountPercent;
    this.rating = obj.rating;
    this.image = obj.image;
    this.updatedAt = obj.updatedAt;
    this.quizId = obj.quizId;
    this.initRedirectUrl();
  }
  initRedirectUrl() {
    switch (this.type) {
      case params.product_types.course:
        this.weburl = 'course-1';
        break;
      case params.product_types.bulk:
        this.weburl = 'bulk-2';
        break;
      case params.product_types.quiz:
        this.weburl = 'quiz-3';
        break;
      case params.product_types.notes:
        this.weburl = 'pdf-4';
        break;
    }
  }
  async userRatingReview(user_id) {
    const productService = new ProductService();
    const obj = await productService.getUserProductReview(
      this._id,
      user_id,
      params.review_type.product_review
    );
    this.userReview = obj[0];
  }
  async videoContent(enrolled) {
    const productService = new ProductService();
    return await productService.getCourseContent(this._id, enrolled);
  }
}

class Comment {
  constructor(obj) {
    this.message = obj.message;
    this.type = obj.type;
    this.object_id = obj.object_id;
    this.rating = obj.rating;
    this.created_by = obj.created_by;
    this.parent_id = obj.parent_id;
  }
}
class VideoContent {
  constructor(obj) {
    this.product_id = obj.product_id;
    this.title = obj.title;
    this.priority = obj.priority;
    this.status = obj.status;
    this.created_by = obj.created_by;
    this.lectures = obj.lectures;
  }
}
module.exports = { Product, VideoContent };
