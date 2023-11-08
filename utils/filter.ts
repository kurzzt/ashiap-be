import { Query } from 'express-serve-static-core';
import { Types } from 'mongoose';

export function genParam(q: Query, filter: Record<string, any>):Record<string, any> {
  const limit = Number(q.limit) || 10
  const page = Number(q.page) || 1
  const skip = limit * (page - 1)

  const params =  Object.keys(q).reduce((res, key) => { 
    if (filter.hasOwnProperty(key)) {
      if (filter[key] === String) res[key] = q[key]
      else if (filter[key] === Number) res[key] = Number(q[key])
      else if (filter[key] === Boolean) res[key] = (q[key] === 'true') ? true : false
      else if (filter[key] === Object) res[key] = new Types.ObjectId(q[key].toString())
      else if (key === 'search') res['$or'] = filter[key].map(x => ({ [x]: { $regex: q[key], $options: "i" } }))
    }
    return res
  }, {})
  return { limit, skip, params }
}