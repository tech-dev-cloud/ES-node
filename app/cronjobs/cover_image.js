import { Product, ProductImage } from '../mongo-models';

export async function coverImage() {
  const productData = Product.find({ cover_image: null }, { _id: 1 }).lean();
  const imageObj=await ProductImage.find(
    { product_id: { $in: productData.map((obj) => obj._id) } },
    { image_path: 1 }
  ).lean();
  for(let index=0;index<imageObj.length;index++){
      Product.updateOne({_id})
  }
}
