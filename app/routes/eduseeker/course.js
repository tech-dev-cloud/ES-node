const JOI = require('joi');
const { USER_ROLE } = require('../../utils/constants');
const { courseController } = require('../../controllers');
const routeUtils = require('../../utils/routeUtils');

const routes = [
    {
        path: '/api/course',
        method: 'POST',
        joiSchemaForSwagger: {
            headers: JOI.object({
                'authorization': JOI.string().required()
            }).unknown(),
            body: {
                name: JOI.string(),
                heading: JOI.string(),
                isPaid: JOI.boolean(),
                price: JOI.number().description('Selling price'),
                strikeprice: JOI.number().description('Actual Price'),
                description: JOI.string(),
                isDraft: JOI.boolean(),
                status: JOI.boolean(),
                benefits: JOI.array().items(JOI.string()),
                targetStudents: JOI.array().items(JOI.string()),
                learning: JOI.array().items(JOI.string()),
                requirements: JOI.array().items(JOI.string()),
                cover_image: JOI.string(),
                promo_video_url: JOI.string(),
                deleteContentIds: JOI.array().items(routeUtils.validation.mongooseId),
                course_content: JOI.array().items(JOI.object({
                    title: JOI.string(),
                    lectures: JOI.array().items(JOI.object({
                        title: JOI.string(),
                        description: JOI.string(),
                        url: JOI.string(),
                        file_type: JOI.string(),
                        duration: JOI.number(),
                        isPreview: JOI.boolean(),
                    }))
                })),

            },
            group: 'Courses',
            description: 'Api to Create a course',
            model: 'CreateCourse'
        },
        auth: [USER_ROLE.TEACHER],
        handler: courseController.createCourse
    },
    {
        path: '/api/course/:courseId',
        method: 'PUT',
        joiSchemaForSwagger: {
            headers: JOI.object({
                'authorization': JOI.string().required()
            }).unknown(),
            params: {
                courseId: routeUtils.validation.mongooseId
            },
            body: {
                name: JOI.string(),
                heading: JOI.string(),
                isPaid: JOI.boolean(),
                price: JOI.number().description('Selling price'),
                strikeprice: JOI.number().description('Actual Price'),
                description: JOI.string(),
                isDraft: JOI.boolean(),
                status: JOI.boolean(),
                benefits: JOI.array().items(JOI.string()),
                targetStudents: JOI.array().items(JOI.string()),
                learning: JOI.array().items(JOI.string()),
                requirements: JOI.array().items(JOI.string()),
                cover_image: JOI.string(),
                promo_video_url: JOI.string(),
                deleteContentIds: JOI.array().items(routeUtils.validation.mongooseId),
                course_content: JOI.array().items(JOI.object({
                    _id: routeUtils.validation.mongooseId,
                    title: JOI.string(),
                    lectures: JOI.array().items(JOI.object({
                        title: JOI.string(),
                        description: JOI.string(),
                        url: JOI.string(),
                        file_type: JOI.string(),
                        duration: JOI.number(),
                        isPreview: JOI.boolean(),
                    }))
                }))
            },
            group: 'Courses',
            description: 'Api to Update a course',
            model: 'UpdateCourse'
        },
        auth: [USER_ROLE.TEACHER],
        handler: courseController.updateCourse
    },
    {
        path: '/api/course/:courseId',
        method: 'GET',
        joiSchemaForSwagger: {
            headers: JOI.object({
                'authorization': JOI.string().required()
            }).unknown(),
            params: JOI.object({
                courseId: routeUtils.validation.mongooseId
            }),
            group: 'Courses',
            description: 'Api to get Course',
            model: 'GetCourse'
        },
        auth: [USER_ROLE.TEACHER],
        handler: courseController.getCourseByID
    },
    {
        path: '/api/videoContent',
        method: 'POST',
        joiSchemaForSwagger: {
            headers: JOI.object({
                'authorization': JOI.string().required()
            }).unknown(),
            body: JOI.object({
                title: JOI.string(),
                lectures: JOI.array().items(JOI.object({
                    title: JOI.string(),
                    description: JOI.string(),
                    url: JOI.string(),
                    file_type: JOI.string(),
                    duration: JOI.number(),
                    isPreview: JOI.boolean(),
                }))
            }),
            group: 'CourseContent',
            description: 'Api to Create course content',
            model: 'CreateCourseContent'
        },
        auth: [USER_ROLE.TEACHER],
        handler: courseController.createCourseContent
    },
    {
        path: '/api/videoContent/:videoContentId',
        method: 'PUT',
        joiSchemaForSwagger: {
            headers: JOI.object({
                'authorization': JOI.string().required()
            }).unknown(),
            params: JOI.object({
                videoContentId: routeUtils.validation.mongooseId
            }),
            body: JOI.object({
                _id: routeUtils.validation.mongooseId,
                title: JOI.string(),
                lectures: JOI.array().items(JOI.object({
                    title: JOI.string(),
                    description: JOI.string(),
                    url: JOI.string(),
                    file_type: JOI.string(),
                    duration: JOI.number(),
                    isPreview: JOI.boolean(),
                }))
            }),
            group: 'CourseContent',
            description: 'Api to Update course content',
            model: 'UpdateCourseContent'
        },
        auth: [USER_ROLE.TEACHER],
        handler: courseController.updateCourseContent
    }
]
module.exports = routes;