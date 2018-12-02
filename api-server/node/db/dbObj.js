const { MongoClient, ObjectID } = require('mongodb');
const { isArray, isObject } = require('util');

const connect = MongoClient.connect;
const url = 'mongodb://mongodb:27017';
const dbName = 'database';

const self = module.exports = {
    init: async () => {
        try
        {
            this.client = await connect(url, { useNewUrlParser: true });
            this.db = this.client.db(dbName);
            console.log("connect success");
        }
        catch (error)
        {
            console.log("mongodb connection error; ", error);
        }
    },

    /**
     * [select description]
     * @param  {[type]}   document       document
     * @param  {[type]}   query          { _id: 56a07a7c57c3b99e3d5969fe }
     * @param  {[type]}   condition      {
     *                                   	skipNumber : 0
     *                                   	limitNumber : 20
     *                                   	sort : {
     *                                   		_id : -1
     *                                   	}
     *                                   }
     */
    select: async (document, query, condition) => {

        let limitNumber;
        let skipNumber;
        let sort = condition.sort;

        // one record data
       if (undefined !== query && isObject(query) && Object.keys(query).length > 0)
       {
           if (query.hasOwnProperty('_id'))
           {
               query._id = new ObjectID(query._id);
           }

           limitNumber = 0;
           skipNumber = 0;
       }
       else
       {
           limitNumber = (undefined !== condition.limit && Number.isInteger(condition.limit)) ? condition.limit : 20;
           skipNumber = (undefined !== condition.skip && Number.isInteger(condition.skip)) ? condition.skip : 0;
       }

       // sort
       if (undefined === sort || !isObject(sort))
       {
           sort = {
               _id: -1
           };
       }
       else
       {
           for (let key in sort)
           {
               sort[key] = (!Number.isInteger(sort[key]) || sort[key] !== 1) && sort[key] !== -1 ? -1 : sort[key];
           }
       }

       const collection = this.db.collection(document);
       return await collection.find(query).skip(skipNumber).limit(limitNumber).sort(sort).toArray();
    },

    insert: (document, data) => {

        data = isArray(data) ? data : [data];
        return new Promise(async (resolve, reject) => {
            try
            {
                const collection = this.db.collection(document);
                const res = await collection.insertMany(data);

                resolve({
                    result: res.result,
                    insertedIds: res.insertedIds
                });
            }
            catch (e)
            {
                console.log(e);
                reject(false);
            }
        });
    },

    update : (document, updateWhere, data) => {

        return new Promise(async (resolve, reject) => {
            try
          {
              const collection = this.db.collection(document);
              const result = await collection.updateMany(updateWhere, { $set: data });
              console.log(result);
              resolve();
          }
          catch (error)
          {
              console.log(error);
              reject(false);
          }
        });
    },

    delete: (document, deleteWhere) => {
      return new Promise(async (resolve, reject) => {
        try
        {
            const collection = this.db.collection(document);
            const result = await collection.deleteOne(deleteWhere);
            console.log(result);
            resolve();
        }
        catch (error)
        {
            console.log(error);
            reject(error)
        }
      });
    }
};
