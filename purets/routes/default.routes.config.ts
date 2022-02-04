import express, { Router } from 'express';
import {corss, corsWithOptions} from './cors.config';
import {routeStore} from '../common/customTypes/types.config'
import UsersMiddleware from '../users/middleware/users.middleware';
import { DefaultController } from '../controllers/default.controller';
import { IController } from '../controllers/Icontroller.controller';

export class DefaultRoutesConfig {
    app:express.Application;
    routeName: string;
    routeParam: string;
    controller:IController | any;
    cors:any;
    corsWithOption:any;
    UsersMWare:UsersMiddleware

    constructor(exp: express.Application, rName: string, control:IController|any, callback?:any) { 
        this.app = exp;
        this.routeName = rName; 
        this.routeParam = this.routeName+'/:id';
        this.cors = corss;
        this.corsWithOption = corsWithOptions;
        this.UsersMWare =  new UsersMiddleware();
        this.controller = typeof control === 'undefined' ? null : control;

        typeof callback === 'function' ? callback(this): this.configureRoutes();
           
        // add instance to routeStore
        routeStore[this.routeName]=this;
        console.log('Added to routeStore :'+this.routeName)

    }
     
     static async instance(exp: express.Application, rName: string, control:any, callback?:any){
        var result =  new DefaultRoutesConfig(exp,rName,control,callback);
      return  await Promise.resolve(result);
    }
    static async createInstancesWithDefault(exp: express.Application, routeNames?:Array<string>){
        if(routeNames && routeNames?.length > 0){
          routeNames.forEach(async name => await  DefaultRoutesConfig.instance(exp, name, await DefaultController.createInstance(name)) )
        }else{
            throw new Error('at least one route name expected')
        }
    }
    getName(): string {
        return this.routeName;
    }

    configureRoutes(){  
   
 
            //this.app.route(item).options(this.corsWithOption, (req, res) => { res.sendStatus(200); } )
        //this.app.route(item)
           this.app.get(this.routeName,this.cors,this.controller.ToList)
           this.app.get(this.routeParam,this.cors,this.controller.getById)
           this.app.post(this.routeName,this.corsWithOption,this.UsersMWare.verifyUser, this.UsersMWare.verifyUserIsAdmin,this.controller.create)  
           this.app.put(this.routeName,this.corsWithOption,this.UsersMWare.verifyUser, this.UsersMWare.verifyUserIsAdmin,this.controller.put)
           this.app.patch(this.routeName,this.corsWithOption,this.UsersMWare.verifyUser, this.UsersMWare.verifyUserIsAdmin,this.controller.patch) 
           this.app.delete(this.routeParam,this.corsWithOption,this.UsersMWare.verifyUser, this.UsersMWare.verifyUserIsAdmin,this.controller.remove);

            
        //this.app.route(this.routename +'/id').get(this.corsWithOption,this.controller.getById);
    }     
     
}
