const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const notificationSchema = new Schema({
  userTo: {type: Schema.Types.ObjectId, ref: 'users'},
  userFrom: {type: Schema.Types.ObjectId, ref: 'users'},
  notificationType: {type: String, enum:['product_review', 'lecture_query', 'feedback']},
  seen:{type:Boolean, default:false},
  entityId: Schema.Types.ObjectId,
  notificationImage: String,
  notificationText: String,
  redirectUrl: String
}, {timestamps:true});

notificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId, notificationText, notificationImage, redirectUrl)=>{
  const data = {
    userTo, userFrom, notificationType, entityId, notificationText, notificationImage, redirectUrl
  }
  await Notification.deleteOne(data);
  return Notification.create(data);
}

notificationSchema.statics.broadcastNotification = async (toUsers, userFrom, notificationType, entityId, redirectUrl)=>{
  const notificationText = getNotificationText(notificationType, userFrom);
  const notifications = toUsers.map(userTo=>({userTo, userFrom:userFrom._id, notificationType, entityId, notificationText,notificationImage: userFrom.profile_pic, redirectUrl }));
  return Notification.insertMany(notifications);
}

notificationSchema.statics.findNotifications = async(limit, lastId, userTo, unseen)=>{
  const cond= {userTo, ...(lastId? {_id:{$lt: lastId}}: {}), ...(unseen?{seen:false}:{})};
  console.log(cond);
  return Notification.find(cond).sort({_id:-1}).limit(limit);
}

notificationSchema.statics.totalCounts = async(user_id, unseen)=>{
  const cond= {userTo: user_id, ...(unseen?{seen:false}:{})};
  return Notification.find(cond).count();
}

notificationSchema.statics.findUnseenCount = async(user_id)=>{
  const cond= {userTo: user_id, seen: false};
  return Notification.find(cond).count();
}

notificationSchema.statics.seen = async(notificationId, user_id)=>{
  return Notification.updateOne({_id:notificationId, userTo:user_id}, {seen: true})
}
const Notification = MONGOOSE.model('notification', notificationSchema);

function getNotificationText(notificationType, user){
  switch(notificationType){
    case 'product_review':
      return `${user.name} has added product review`;
    case 'lecture_query':
      return `${user.name} has posted a comment`;
  }
}
module.exports = { Notification };
