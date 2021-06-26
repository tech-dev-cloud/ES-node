const { TermsModel } = require('../../mongo-models');

let controller = {
    createTerm: async (request, response) => {
        let obj = new TermsModel(payload);
        await obj.save();
        return true;
    },
    getTerms: async (request, response) => {
        let limit = request.query.limit;
        let skip = request.query.skip;
        let match = {};
        if (payload.parent_id) {
            match['parent_id'] = payload.parent_id;
        }
        if (request.query.searchString) {
            match['$text'] = { $search: request.query.searchString };
        }
        return await TermsModel.find(match).sort({ _id: 1 }).skip(payload.index * 20).limit(20);
    },
}
module.exports = { termController: controller }