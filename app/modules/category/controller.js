const taxonomyService = require('./service');
const taxonomy = {
  addNewCategory: async (request, response) => {
    taxonomyService
      .createNewTaxonomy(request.body)
      .then((res) => {
        response.status(200).json({
          success: true,
          message: 'Taxonomy add successfully',
        });
      })
      .catch((err) => {
        response.status(500).json({
          success: false,
          message: 'Something went wrong',
          debug: err,
        });
      });
  },
};
module.exports = { taxonomy };
