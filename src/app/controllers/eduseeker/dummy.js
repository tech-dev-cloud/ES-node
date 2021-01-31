const {QuestionModel, Product, ProductQuestionMap, ProductImage}=require('../../models');
const request = require('request');
let mongoose=require('mongoose');

const controller = {
    questions:async(payload)=>{
        request({
            url:"http://api.eduseeker.in/api/question?subjectId=5f43f643dcb5622553b494dd",
            method:"GET",
            headers: {
               Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjpbMV0sImlkIjoiNWY0YjgyMWY4ZGE1YmY3NWNiZDFjZmIyIiwiaWF0IjoxNjEwMDA2NDYwfQ.8tO9tEfWlxygA7uKY3KrailwCKDahYhq1_PE0f6KWEg',
            },
        },(err, r, b)=>{
            if (!err && b) {
                const body = JSON.parse(b);
                QuestionModel.insertMany(body.items);
            }
        })
    },
    // users:async()=>{
    //     request({
    //         url:"http://api.eduseeker.in/api/question?subjectId=5f43f643dcb5622553b494dd",
    //         method:"GET",
    //         headers: {
    //            Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjpbMV0sImlkIjoiNWY0YjgyMWY4ZGE1YmY3NWNiZDFjZmIyIiwiaWF0IjoxNjEwMDA2NDYwfQ.8tO9tEfWlxygA7uKY3KrailwCKDahYhq1_PE0f6KWEg',
    //         },
    //     },(err, r, b)=>{
    //         if (!err && b) {
    //             const body = JSON.parse(b);
    //             QuestionModel.insertMany(body.items);
    //         }
    //     })
    // },
    products:async(payload)=>{
        request({
            url:"http://api.eduseeker.in/api/quiz",
            method:"GET",
            headers: {
               Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjpbMV0sImlkIjoiNWY0YjgyMWY4ZGE1YmY3NWNiZDFjZmIyIiwiaWF0IjoxNjEwMDA2NDYwfQ.8tO9tEfWlxygA7uKY3KrailwCKDahYhq1_PE0f6KWEg',
            },
        },(err, r, b)=>{
            if (!err && b) {
                const body = JSON.parse(b);
                let products=[];
                let pq_map=[];
                let product_images=[];
                for(let index=0;index<body.items.length;index++){
                    let product=body.items[index];
                    products.push({
                        _id:mongoose.Types.ObjectId(product._id),
                        name:product.title,
                        heading:product.headline,
                        price:product.amount,
                        isPaid:!!product.isPaid,
                        type:'2',
                        status:true,
                        validity:6,
                        product_meta:{
                            subject_id:mongoose.Types.ObjectId(product.subjectData._id),
                            time_limit: product.attemptTime,
                            totalQuestions: product.totalQuestions
                        },
                        created_by:mongoose.Types.ObjectId(product.instructor._id),
                        benefits: product.benefits,
                        createdAt: new Date(product.createdAt),
                        updatedAt: new Date(product.updatedAt),
                    })
                    product_images.push({
                        product_id: mongoose.Types.ObjectId(product._id),
                        image_path: product.imageURL,
                        type:'1'
                    })
                    for(let question_id of product.questions){
                        pq_map.push({
                            product_id:mongoose.Types.ObjectId(product._id),
                            question_id:mongoose.Types.ObjectId(question_id)
                        })
                    }
                }
                Product.insertMany(products);
                ProductQuestionMap.insertMany(pq_map);
                ProductImage.insertMany(product_images);
            }
        })
    },
}
module.exports={dummy:controller}