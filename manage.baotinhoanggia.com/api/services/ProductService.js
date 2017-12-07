const BigNumber = require('bignumber.js');
const mongoose = require('mongoose');
const sysUtils = require('../../utils/system');

const calculateProductAvailable = async function (principal, productID) {
    "use strict";
    
    let inStocks = _app.model.InStock.find({productID: productID});
    let outStocks = _app.model.OutStock.find({productID: productID});
    
    if (!sysUtils.isSuperAdmin(principal)) {
        inStocks = inStocks.where('branchID', principal.user.branchID._id);
        outStocks = outStocks.where('branchID', principal.user.branchID._id);
    }
    
    inStocks = await inStocks.exec();
    outStocks = await outStocks.exec();
    
    //-- sum
    let stocks = {};
    
    inStocks.forEach(stock => {
        if (!stocks[stock.branchID]) stocks[stock.branchID] = {_id: stock.branchID, sum: 0};
        stocks[stock.branchID].sum += stock.quantity;
    });
    outStocks.forEach(stock => {
        if (!stocks[stock.branchID]) stocks[stock.branchID] = {_id: stock.branchID, sum: 0};
        stocks[stock.branchID].sum -= stock.quantity;
    });
    return stocks;
    // return Object.keys(stocks).map(function(key){ return stocks[key]; });
};

module.exports = {
    
    //----------- product category -------------
    
    addProductCategory: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] name: product category name
            }
         */
        try {
            //-- check if the name existed
            
            let category = await _app.model.ProductGroup.findOne({name: params.name});
            if (category)
                return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            category = new _app.model.ProductGroup({
                name: params.name
            });
            
            category = await category.save();
            
            return sysUtils.returnSuccess(category);
        }
        catch (err) {
            console.log('addProductCategory:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getProductCategory: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: product id
            }
         */
        try {
            //-- check if the name existed
            
            let category = await _app.model.ProductGroup.findById(params._id);
            if (!category)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            return sysUtils.returnSuccess(category);
        }
        catch (err) {
            console.log('getProductCategory:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    updateProductCategory: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: the id of product category
                [required] name: new product category name
            }
         */
        try {
            //-- check if the name existed
            
            let category = await _app.model.ProductGroup.findById(params._id);
            if (!category)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let namedCategory = await _app.model.ProductGroup.findOne({name: params.name});
            if (namedCategory && namedCategory.name === params.name && String(namedCategory._id) !== String(category._id))
                if (category)
                    return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            category.name = params.name;
            category = await category.save();
            
            return sysUtils.returnSuccess(category);
        }
        catch (err) {
            console.log('updateProductCategory:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    removeProductCategory: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: the id of product category
            }
         */
        try {
            //-- check if dirty
            
            let category = await _app.model.ProductGroup.findById(params._id);
            if (!category)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let types = await _app.model.ProductType.find({groupID: category._id});
            if (types && types.length)
                return sysUtils.returnError(_app.errors.RESOURCE_DIRTY_ERROR);
            
            category = await _app.model.ProductGroup.findByIdAndRemove(category._id);
            
            return sysUtils.returnSuccess(category);
        }
        catch (err) {
            console.log('removeProductCategory:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    changeTypeGroup: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] typeID: the id of product type
                [required] newGroupID: the id of product group to switch this type to
            }
         */
        try {
            let type = await _app.model.ProductType.findById(params.typeID);
            let group = await _app.model.ProductGroup.findById(params.newGroupID);
            
            if (!type || !group)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            type.groupID = group._id;
            await type.save();
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('changeTypeGroup:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllProductCategories: async function (principal, params) {
        "use strict";
        /*
            params: {
                query: query by name
                with_count: count the product type & product of each product
            }
         */
        try {
            let categories;
            if (params.with_count) {
                categories = await _app.model.ProductGroup.aggregate([
                    {
                        $lookup: {
                            from: "productType",
                            localField: "_id",
                            foreignField: "groupID",
                            as: "productTypes"
                        }
                    },
                    {
                        $unwind: {
                            path: "$productTypes",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "product",
                            localField: "productTypes._id",
                            foreignField: "typeID",
                            as: "products"
                        },
                    },
                    {
                        $addFields: {
                            productCount: {$size: "$products"}
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            name: {$first: "$name"},
                            types: {$push: "$productTypes"},
                            productSize: {$sum: "$productCount"}
                        }
                    },
                    {
                        $project: {
                            name: "$name",
                            productCount: "$productSize",
                            typeCount: {$size: "$types"},
                        }
                    },
                ]);
                // console.log(categories);
            }
            else {
                categories = await _app.model.ProductGroup.find({});
            }
            if (params.query) {
                let regex = new RegExp(`.*${sysUtils.removeAccent(sysUtils.regexEscape(params.query))}.*`, 'i');
                categories = categories.filter(cat => {
                    return !!regex.exec(sysUtils.removeAccent(cat.name));
                });
            }
            return sysUtils.returnSuccess(categories);
        }
        catch (err) {
            console.log('getAllProductCategories:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    //----------- product brand -------------
    
    addProductBrand: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] name: brand name
                origin: brand origin
            }
         */
        try {
            //-- check if the name existed
            
            let brand = await _app.model.ProductBrand.findOne({name: params.name});
            if (brand)
                return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            brand = new _app.model.ProductBrand({
                name: params.name,
                origin: params.origin
            });
            
            brand = await brand.save();
            
            return sysUtils.returnSuccess(brand);
        }
        catch (err) {
            console.log('addProductBrand:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getProductBrand: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: brand id
            }
         */
        try {
            let brand = await _app.model.ProductBrand.findById(params._id);
            if (!brand)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            return sysUtils.returnSuccess(brand);
        }
        catch (err) {
            console.log('addProductBrand:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    updateProductBrand: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: the id of product category
                [required] name: new product category name
                origin,
            }
         */
        try {
            //-- check if the name existed
            
            let brand = await _app.model.ProductBrand.findById(params._id);
            if (!brand)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let namedBrand = await _app.model.ProductBrand.findOne({name: params.name});
            if (namedBrand && namedBrand.name === params.name && String(namedBrand._id) !== String(brand._id))
                if (brand)
                    return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            brand.name = params.name;
            brand.origin = params.origin;
            
            brand = await brand.save();
            
            return sysUtils.returnSuccess(brand);
        }
        catch (err) {
            console.log('updateProductBrand:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    removeProductBrand: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: the id of product brand
            }
         */
        try {
            
            //-- check dirty
            
            let brand = await _app.model.ProductBrand.findById(params._id);
            if (!brand)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let products = await _app.model.Product.find({brandID: brand._id});
            if (products && products.length)
                return sysUtils.returnError(_app.errors.RESOURCE_DIRTY_ERROR);
            
            brand = await _app.model.ProductBrand.findByIdAndRemove(brand._id);
            
            return sysUtils.returnSuccess(brand);
        }
        catch (err) {
            console.log('removeProductBrand:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllProductBrands: async function (principal, params) {
        "use strict";
        /*
            params: {
                query: query by name
                with_count: count the product type of each product
            }
         */
        try {
            let brands;
            if (params.with_count) {
                brands = await _app.model.ProductBrand.aggregate([
                    {
                        $lookup: {
                            from: "product",
                            localField: "_id",
                            foreignField: "brandID",
                            as: "products"
                        }
                    }
                ]);
                brands.forEach(brand => {
                    brand.size = brand.products.length;
                    delete brand.products;
                });
            }
            else {
                brands = await _app.model.ProductBrand.find({});
            }
            if (params.query) {
                let regex = new RegExp(`.*${sysUtils.removeAccent(sysUtils.regexEscape(params.query))}.*`, 'i');
                brands = brands.filter(b => {
                    return !!regex.exec(sysUtils.removeAccent(b.name));
                });
            }
            return sysUtils.returnSuccess(brands);
        }
        catch (err) {
            console.log('getAllProductBrands:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    //----------- product type -------------
    
    addProductType: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] groupID: id of category
                [required] name: product category name
            }
         */
        try {
            //-- check if the name existed
            let type = await _app.model.ProductType.findOne({name: params.name});
            if (type)
                return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            let category = await _app.model.ProductGroup.findById(params.groupID);
            if (!category)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            type = new _app.model.ProductType({
                groupID: category._id,
                name: params.name
            });
            
            type = await type.save();
            
            return sysUtils.returnSuccess(type);
        }
        catch (err) {
            console.log('addProductType:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getProductType: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: id of type
            }
         */
        try {
            //-- check if the name existed
            let type = await _app.model.ProductType.findById(params._id).populate('groupID');
            if (!type)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            return sysUtils.returnSuccess(type);
        }
        catch (err) {
            console.log('getProductType:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    updateProductType: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: the id of product category
                [required] name: new product category name
            }
         */
        try {
            //-- check if the name existed
            
            let type = await _app.model.ProductType.findById(params._id);
            if (!type)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let namedType = await _app.model.ProductType.findOne({name: params.name});
            if (namedType && namedType.name === params.name && String(namedType._id) !== String(type._id))
                if (type)
                    return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            type.name = params.name;
            type = await type.save();
            
            return sysUtils.returnSuccess(type);
        }
        catch (err) {
            console.log('updateProductType:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    removeProductType: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: the id of product category
            }
         */
        try {
            //-- check if dirty
            
            let type = await _app.model.ProductType.findById(params._id);
            if (!type)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let products = await _app.model.Product.find({typeID: type._id});
            if (products && products.length)
                return sysUtils.returnError(_app.errors.RESOURCE_DIRTY_ERROR);
            
            type = await _app.model.ProductType.findByIdAndRemove(type._id);
            
            return sysUtils.returnSuccess(type);
        }
        catch (err) {
            console.log('removeProductType:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllTypesFromCategory: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] groupID,
                query: filter by name
                with_count: count the product of each type
            }
         */
        try {
            let types;
            if (params.with_count) {
                types = await _app.model.ProductType.aggregate([
                    {
                        $match: {groupID: mongoose.Types.ObjectId(params.groupID)}
                    },
                    {
                        $lookup: {
                            from: "product",
                            localField: "_id",
                            foreignField: "typeID",
                            as: "products"
                        }
                    }
                ]);
                types.forEach(type => {
                    type.size = type.products.length;
                    delete type.products;
                });
            }
            else {
                types = await _app.model.ProductType.find({groupID: params.groupID});
            }
            
            if (params.query) {
                let regex = new RegExp(`.*${sysUtils.removeAccent(sysUtils.regexEscape(params.query))}.*`, 'i');
                types = types.filter(t => {
                    return !!regex.exec(sysUtils.removeAccent(t.name));
                })
            }
            return sysUtils.returnSuccess(types);
        }
        catch (err) {
            console.log('getAllTypesFromCategory:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllProductTypes: async function (principal, params) {
        "use strict";
        /*
            params: {
                query: filter by name
            }
         */
        try {
            let types = await _app.model.ProductType.find({});
            if (params.query) {
                let regex = new RegExp(`.*${sysUtils.removeAccent(sysUtils.regexEscape(params.query))}.*`, 'i');
                types = types.filter(t => {
                    return !!regex.exec(sysUtils.removeAccent(t.name));
                })
            }
            return sysUtils.returnSuccess(types);
        }
        catch (err) {
            console.log('getAllProductTypes:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    removeProduct: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: the product id
            }
         */
        try {
            let product = await _app.model.Product.findById(params._id);
            if (!product)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            //-- remove s3 photos
            ProductService.removeProductPhotos(principal, {
                _id: product._id, fileNames: product.photos.map(photo => {
                    return photo.fileName
                })
            });
            await product.remove();
            
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('removeProduct:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    //----------- product -------------
    addProduct: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] typeID: ID of the product type,
                [required] brandID: ID of the brand,
                [required, unique] model,
                stockIDs: IDs of selected branches
                supplierIDs: ID of suppliers
                description,
                price: the price
                
                photosNumber: number of returned upload urls
                initInStock: init amount in stock
                initInPrice: init in stock price
            }
         */
        try {
            let type = await _app.model.ProductType.findById(params.typeID);
            let brand = await _app.model.ProductBrand.findById(params.brandID);
            
            if (!type || !brand)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let product = await _app.model.Product.findOne({typeID: type._id, brandID: brand._id, model: params.model});
            if (product)
                return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
    
            let initInStock = Number(params.initInStock || "0");
            let initInPrice = new BigNumber(params.initInPrice || "0");
            let initOutPrice = new BigNumber(params.price || "0");
            
            let productData = {
                typeID: type._id,
                brandID: brand._id,
                model: params.model,
                stockIDs: params.stockIDs,
                supplierIDs: params.supplierIDs,
                description: params.description,
                price: initOutPrice.toString()
            };
            
            product = new _app.model.Product(productData);
            product = await product.save();
            
            product.stockPeek = initInStock;
            
            let inStock = new _app.model.InStock({
                productID: product._id,
                branchID: params.branchID,
                userID: principal.user._id,
                quantity: initInStock,
                price: initInPrice.toString(),
                metaInfo: _app.model.InStock.constants.STOCK_INIT_STOCK,
            });
            await inStock.save();
            
            let outStock = new _app.model.OutStock({
                productID: product._id,
                branchID: params.branchID,
                userID: principal.user._id,
                quantity: new BigNumber(0).toString(),
                price: initOutPrice.toString(),
                metaInfo: _app.model.OutStock.constants.STOCK_INIT_STOCK,
            });
            await inStock.save();
            await outStock.save();
            
            let returnObject = {product: product};
            
            //-- generate photo upload url
            if (!isNaN(params.photosNumber)) {
                let photoCount = Number(params.photosNumber);
                if (photoCount > 0) {
                    photoCount = Math.min(photoCount, sails.config.PRODUCT_MAX_PHOTO);
                    
                    //-- return a pre-signed url to upload logo
                    let imageUrls = [];
                    let uploadUrls = [];
                    for (let i = 0; i < photoCount; i++) {
                        let fileName = `product-${product._id}-photo${Date.now()}`;
                        let objectPath = sails.config.PRODUCT_PHOTO_BUCKET_PREFIX + '/' + fileName;
                        
                        let url = `https://${sails.config.S3_ASSET_BUCKET}.s3.amazonaws.com/${objectPath}`;
                        imageUrls.push(url);
                        
                        let uploadUrl = await _app.S3.getSignedUrl('putObject', {
                            Bucket: sails.config.S3_ASSET_BUCKET,
                            Key: objectPath,
                            Expires: sails.config.PRESIGNED_URL_TIMEOUT_SEC,
                            ContentType: 'image/*'
                        });
                        uploadUrls.push(uploadUrl);
                        
                        product.photos.push({
                            fileName: fileName,
                            url: url
                        });
                    }
                    
                    //-- update to product
                    product = await product.save();
                    returnObject.product = product;
                    returnObject.uploadUrls = uploadUrls;
                }
            }
            
            return sysUtils.returnSuccess(returnObject);
            
        }
        catch (err) {
            console.log('addProduct:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    updateProduct: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: id of the product,
                [required, unique] model: the product model,
                description,
                [required] typeID,
                [required] brandID,
                stockIDs,
                supplierIDs,
                addedPhotos,
            }
         */
        try {
            let product = await _app.model.Product.findById(params._id);
            if (!product)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            product.model = params.model;
            product.description = params.description;
            product.typeID = params.typeID;
            product.brandID = params.brandID;
            product.stockIDs = params.stockIDs;
            product.supplierIDs = params.supplierIDs;
            
            let returnObject = {};
            
            //-- generate photo upload url
            if (!isNaN(params.addedPhotos)) {
                let photoCount = Number(params.addedPhotos);
                if (photoCount > 0) {
                    photoCount = Math.min(photoCount, sails.config.PRODUCT_MAX_PHOTO - product.photos.length);
                    
                    //-- return a pre-signed url to upload logo
                    let imageUrls = [];
                    let uploadUrls = [];
                    for (let i = 0; i < photoCount; i++) {
                        let fileName = `product-${product._id}-photo${Date.now()}`;
                        let objectPath = sails.config.PRODUCT_PHOTO_BUCKET_PREFIX + '/' + fileName;
                        
                        let url = `https://${sails.config.S3_ASSET_BUCKET}.s3.amazonaws.com/${objectPath}`;
                        imageUrls.push(url);
                        
                        let uploadUrl = await _app.S3.getSignedUrl('putObject', {
                            Bucket: sails.config.S3_ASSET_BUCKET,
                            Key: objectPath,
                            Expires: sails.config.PRESIGNED_URL_TIMEOUT_SEC,
                            ContentType: 'image/*'
                        });
                        uploadUrls.push(uploadUrl);
                        
                        product.photos.push({
                            fileName: fileName,
                            url: url
                        });
                    }
                    
                    returnObject.uploadUrls = uploadUrls;
                }
            }
            
            //-- update to product
            product = await product.save();
            
            //-- return a full object
            let productFull = await ProductService.getProduct(principal, {_id: product._id, full_info: true});
            if (!productFull.success)
                return productFull;
            
            returnObject.product = productFull.result;
            
            return sysUtils.returnSuccess(returnObject);
            
        }
        catch (err) {
            console.log('addProduct:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getProduct: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: product id
                full_info: boolean: whether to get full product info
                stock_info: boolean: whether to get stock info
            }
         */
        try {
            let product;
            if (params.full_info) {
                
                product = await _app.model.Product.findById(params._id).populate({
                    path: 'typeID',
                    populate: {path: 'groupID'}
                }).populate('brandID').populate('supplierIDs').populate('stockIDs').lean().exec();
                
                if (!product)
                    return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
                
                if (!sysUtils.isSuperAdmin(principal) && product.stockIDs.findIndex(stock => {
                        return String(stock._id) === String(principal.user.branchID._id);
                    }) < 0)
                    return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
                
                if (!sysUtils.isSuperAdmin(principal))
                    delete product.stockIDs;
                
                //-- query for available
                if (params.stock_info)
                    product.stockSum = await calculateProductAvailable(principal, product._id);
                
                //-- get latest outPrice && latest average inPrice for each supplier
                let lastOutStock = await _app.model.OutStock.findOne({productID: product._id}).sort({createdAt: '-1'});
                
                //console.log('lastOutStock:', lastOutStock);
                
                let lastInStockNoSup = await _app.model.InStock.findOne({
                    productID: product._id,
                    supplierID: null
                }).sort({createdAt: '-1'});
                
                //console.log('lastInStockNoSup:', lastInStockNoSup);
                
                let lastInStockForSups = [];
                if (product.supplierIDs.length) {
                    product.supplierIDs.forEach(sup => {
                        lastInStockForSups.push({
                            supplierID: sup._id
                        });
                    });
                    for (let i = 0; i < lastInStockForSups.length; i++) {
                        lastInStockForSups[i] = await _app.model.InStock.findOne({
                            productID: product._id,
                            supplierID: lastInStockForSups[i].supplierID
                        }).sort({createdAt: '-1'});
                        if (!lastInStockForSups[i]) lastInStockForSups[i] = lastInStockNoSup;
                    }
                }
                else {
                    if (lastInStockNoSup) lastInStockForSups.push(lastInStockNoSup);
                }
                
                // console.log('lastInStockForSups:', lastInStockForSups);
                
                product.lastOutStock = lastOutStock;
                product.lastInStocks = lastInStockForSups;
            }
            else {
                product = await _app.model.Product.findById(params._id);
            }
            return sysUtils.returnSuccess(product);
        }
        catch (err) {
            console.log('getProduct:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllProductsWithDetails: async function (principal, params) {
        "use strict";
        /*
            params: {
                stock_info: query stock info
            }
         */
        try {
            let productsPromise = _app.model.Product.find({}).populate('brandID').populate('typeID');
            if (params.filter && params.filter.length)
                params.filter.forEach(pair => {
                    productsPromise = productsPromise.where(pair.attr, pair.value);
                });
            
            if (!sysUtils.isSuperAdmin(principal))
                productsPromise = productsPromise.where('stockIDs', principal.user.branchID._id);
            productsPromise = productsPromise.lean().exec();
            
            let products = await productsPromise;
            
            //-- query for last stock
            for (let i = 0; i < products.length; i++) {
                if (!sysUtils.isSuperAdmin())
                    delete products[i].stockIDs;
                products[i].lastOutStock = await _app.model.OutStock.findOne({productID: products[i]._id}).sort({createdAt: '-1'});
                if (params.stock_info) products[i].stockSum = await calculateProductAvailable(principal, products[i]._id);
            }
            
            return sysUtils.returnSuccess(products);
        }
        catch (err) {
            console.log('getAllProductsWithDetails:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    removeProductPhotos: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: product id
                [required] fileNames: the file names of product photo
            }
         */
        try {
            let product = await _app.model.Product.findById(params._id);
            if (!product)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let deleteFiles = {
                Objects: [],
                Quiet: false,
            };
            let fileNames = [];
            if (params.fileNames.length) {
                params.fileNames.forEach(file => {
                    if (product.photos.findIndex(photo => {
                            return photo.fileName === file;
                        }) >= 0) {
                        deleteFiles.Objects.push({Key: sails.config.PRODUCT_PHOTO_BUCKET_PREFIX + '/' + file});
                        fileNames.push(file);
                    }
                });
            }
            
            if (!deleteFiles.Objects.length)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            //-- call s3 to remove file
            let s3Params = {
                Bucket: sails.config.S3_ASSET_BUCKET,
                Delete: deleteFiles,
            };
            await _app.S3.deleteObjects(s3Params).promise();
            
            //-- update database
            fileNames.forEach(file => {
                let index = product.photos.findIndex(photo => {
                    return photo.fileName === file;
                });
                if (index >= 0)
                    product.photos.splice(index, 1);
            });
            
            await product.save();
            
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('removeProductPhoto:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    changeProductPrice: async function (principal, params) {
        "use strict";
        /*
            params: {
                [required] _id: product id
                [required]: price, the new price to set
            }
         */
        try {
            let product = await _app.model.Product.findById(params._id);
            if (!product)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let price = new BigNumber(params.price).toString();
            let outStock = new _app.model.OutStock({
                productID: product._id,
                branchID: principal.user.branchID,
                userID: principal.user._id,
                quantity: 0,
                price: price,
                metaInfo: _app.model.OutStock.constants.STOCK_MANUAL_CHANGE
            });
            await outStock.save();
            
            product.price = price;
            await product.save();
            
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('changeProductPrice:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    }
};
