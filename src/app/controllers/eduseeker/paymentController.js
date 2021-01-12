const { PRODUCT_TYPE, PAYMENT_PURPOSE, ERROR_TYPE } = require('../../utils/constants');
const MESSAGES = require('../../utils/messages');
const { userService, quizService, paymentService } = require('../../services');
const {PaymentModel, UserModel}=require('../../models');
const responseHelper = require('../../utils/responseHelper');

const controller = {
  createPayment :async (payload) => {
    let user, product={};
    try {
      //Add user details
      user = await userService.getUser({ _id: payload.user.userId });
      let paymentObject = {
        buyer_name: user.name,
        email: user.email,
        phone: user.phoneNumber
      }
      // Add Product details
      switch (payload.productType) {
        case PRODUCT_TYPE.QUIZ:
          const alreadyEnrolled=await PaymentModel.findOne({userId: payload.user.userId, productId:payload.productId, status:'Credit'}).lean();
          if(alreadyEnrolled){
            throw responseHelper.createErrorResponse(ERROR_TYPE.ALREADY_EXISTS, MESSAGES.QUIZ.DUPLICATE);
          }
          product = await quizService.getQuiz({ _id: payload.productId });
          paymentObject.amount = product.amount;
          paymentObject.purpose = PAYMENT_PURPOSE.Quiz
          break;
      }
      if(!product.isPaid){
          const data=await paymentService.freeEnrolled(payload, product);
          return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data)
      }
      paymentObject.webhook = "https://api.eduseeker.in/api/payment/webhook";
      paymentObject.redirect_url="https://eduseeker.in/order-confirm"
      const data = await paymentService.createPayment(paymentObject, payload);
      return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data);
    } catch (err) {
      throw err;
    }
  
  },
  webhook :async (payload) => {
    const data = await paymentService.webhook(payload);
    return;
  },
  getAllPayments:async(payload)=>{
    let match={parent_id:null};
    let $addFields={};
    if(payload.status){
      match.status=payload.status;
    }
    if(payload.appPurchased=='true'){
      match['grand_total']=null;
      match['parent_id']=null;
    }
    if(payload.appPurchased=='false'){
      match['grand_total']={$ne:null};
    }
    if(payload.createdAt){
      $addFields["creationDate"] = {$dateToString: {format: "%Y-%m-%d", date: "$createdAt", timezone: "+0530"}};
      match["creationDate"] = payload.createdAt;
    }
    let query = [];
    if (Object.keys($addFields).length) {
        query[0] = {$addFields};
    }
    query=[
      ...query,
      {$match:match},
      {$lookup:{localField:"userId",foreignField:"_id", from:"users", as:"userData"}},
      {$unwind:"$userData"},
      {$lookup:{localField:"productId",foreignField:"_id", from:"quizzes", as:"quizData"}},
      {$unwind:"$quizData"},
      {$project:{price:1,grand_total:1,status:1,payment_request_id:1,"userData._id":1,"userData.name":1,"userData.email":1,"quizData.title":1, "quizData.title":1,"quizData.amount":1,createdAt:1}},
      {$sort:{_id:-1}}
    ]
    let orders=await PaymentModel.aggregate(query);
    let totalPurchaseAmount=0;
    for(let index=0;index<orders.length;index++){
      totalPurchaseAmount+=(orders[index].grand_total || orders[index].quizData.amount);
    }
    return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, {orders,totalPurchaseAmount});
  },
  addPayment:async(payload)=>{
    let userData=await UserModel.find({email:payload.email},{_id:1}).lean();
    if(!userData){
    return responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST,"No user found with this email");
    }
    let paymentData=payload.product_ids.map(id=>{
      return{
        userId:userData[0]._id,
        status:payload.status,
        productId:id,
        created_by:payload.user.userId
      }
    })
    paymentData[0]={...paymentData[0],grand_total:payload.grand_total};
    let parentObj=paymentData.splice(0,1);
    let parentOrder=new PaymentModel(parentObj[0]);
    let obj=(await parentOrder.save()).toObject();
    if(paymentData.length){
      paymentData=paymentData.map(el=>({...el, parent_id:obj._id}));
      await PaymentModel.insertMany(paymentData);
    }
    return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS,{SUCCESS:true});
  },
  updatePayment:async(payload)=>{
    let userData=await UserModel.find({email:payload.email},{_id:1}).lean();
    if(!userData){
      return responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST,"No user found with this email");
    }
    await PaymentModel.updateOne({_id:payload.id},{...payload, userId:userData[0]._id})
    return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS,{SUCCESS:true});
  },
  getPaymentByID:async(payload)=>{
    let payment=await PaymentModel.aggregate([
      {$match:{$or:[{_id: payload.id},{parent_id :payload.id}]}}
    ]);
    let userData=await UserModel.find({_id:payment[0].userId},{name:1, email:1}).lean();
    return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS,{payment,userData:userData[0]});
  }
}

module.exports = { paymentController: controller };