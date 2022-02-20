"use strict";
const { dbStore } = require('../../common/customTypes/types.config');
const { Assert, AssertionError} = require('../../common/customTypes/assert');
class DefaultController {

  constructor(name) {
    this.db = dbStore[name];
  }

  static async createInstance(svcName) {
    return await Promise.resolve(new DefaultController(svcName));
  }
 

 async list (req, res, next){
      let items =  await this.db.Tolist(20, 0);
      res.json({success:true, items:items})
    
  }
 async create(req, res, next){
     let item = await this.db.create(...req.body);
        console.log('document Created :', item);
        res.json({ success:true, id: item.id });
  }


 async getById(req, res, next){
     let item = await this.db.getById(req.params.id);
        res.json({success:true,item: item || {}})  
  }

 async patch(req, res, next){
     await this.db.patchById(req.params.Id, ...req.body);
        this.sendJson({ "status": "OK" }, 204, res);
  }

 async put(req, res, next){
      await this.putById(req.params.Id, ...req.body);
        this.sendJson({ "status": "OK" }, 204, res);
  }

 async remove(req, res, next){
      await this.db.deleteById(req.params.id);
        this.sendJson({ "status": "OK" }, 204, res);
    }
  

  ////// helpers
  extractId(req, res, next) {
    req.body.id = req.params.id;
    next();
  }
  sendJson(obj, status, res) {
    res.setHeader('Content-Type', 'application/json');
    res.status(status).json(obj);
  }

  resultCb ={
    res:(res,next,callback)=>{
       return {
         cb:(err, obj)=> {
            if (err){
              if (err instanceof AssertionError) {
                res.json({ success: false, error: err})
              } 
              //res.json({ success: false, message: 'operation Unsuccessful!', err: err })
              next(err)
            }else if (obj) {
              typeof callback ==='function'? callback(obj) : res.json({ success: true, message: 'operation Successful!' })
            }
            else if(!err && !obj) {
              res.json({ success: false, message: 'operation Unsuccessful!', error: 'error' })
            }   
          }    
       }
  }}
}

exports.DefaultController = DefaultController;