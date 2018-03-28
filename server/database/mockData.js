import {prop, values, flatten, mapObjIndexed, map, compose, curry} from 'ramda';

export const persons = [

  {
    firstName: 'Bob',
    lastName: 'Dilan'
  },

  {
    firstName: 'Tim',
    lastName: 'Guenard'
  }
];

export const trips = [

  {
    departureDateTime: '2018-03-03',
    returnDateTime: '2018-03-04',
    comments: 'Fishing trip #1'
  },

  {
    departureDateTime: '2018-03-05',
    returnDateTime: '2018-03-06',
    comments: 'Fishing trip #2'
  }
];

