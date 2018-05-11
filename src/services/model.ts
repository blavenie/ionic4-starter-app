import {Moment} from "moment/moment";

export const StatusIds = {
  DISABLE: 0,
  ENABLE: 1,
  TEMPORARY: 2
}

export declare interface Cloneable<T> {
  clone(): T;
}

export abstract class Entity<T> implements Cloneable<T> {
  id: number;
  updateDate: Date | Moment;
  dirty: boolean = false;

  abstract clone(): T;

  asObject(): any {
    const target:any = Object.assign({}, this);
    delete target.dirty;
    delete target.__typename;
    return target;
  }

  fromObject(source:any) {
    this.id = source.id;
    this.updateDate = source.updateDate;
    this.dirty = source.dirty;
  }
}


export class Referential extends Entity<Referential>  {
  label: string;
  name: string;

  constructor(data?: {
    id?: number,
    label?: string,
    name?: string} ) {
    super();
    this.id = data && data.id;
    this.label = data && data.label;
    this.name = data && data.name;
  }

  clone(): Referential {
    return Object.assign(new Referential(), this);
  }

  fromObject(source:any) {
    super.fromObject(source);
    this.label = source.label;
    this.name = source.name;
  }
}

export class VesselFeatures extends Entity<VesselFeatures>  {
  vesselId: number;
  name: string;
  exteriorMarking: string;
  basePortLocation: Referential;

  constructor() {
    super();
    this.basePortLocation = new Referential();
  }

  clone(): VesselFeatures {
    const target = new VesselFeatures();
    this.copy(target);
    return target;
  }

  copy(target: VesselFeatures): VesselFeatures {
    target.fromObject(this);
    return target;
  }

  asObject(): any {
    const target:any = super.asObject();
    target.basePortLocation = this.basePortLocation && this.basePortLocation.asObject() || undefined;
    return target;
  }

  fromObject(source:any): VesselFeatures {
    super.fromObject(source);
    this.exteriorMarking = source.exteriorMarking;
    this.name = source.name;
    this.vesselId = source.vesselId;
    source.basePortLocation && this.basePortLocation.fromObject(source.basePortLocation);
    return this;
  }
}

export class Trip extends Entity<Trip> {
  departureDateTime: Date | Moment;
  returnDateTime: Date | Moment;
  comments: string;
  creationDate: Date | Moment;
  departureLocation: Referential;
  returnLocation: Referential;
  recorderDepartment: Referential;
  vesselFeatures: VesselFeatures;

  constructor() {
    super();
    this.departureLocation = new Referential();
    this.returnLocation = new Referential();
    this.recorderDepartment = new Referential();
    this.vesselFeatures = new VesselFeatures();
    this.dirty = false;
  }

  clone(): Trip {
    const res = Object.assign(new Referential(), this);
    res.departureLocation = this.departureLocation && this.departureLocation.clone() || undefined;
    res.returnLocation = this.returnLocation && this.returnLocation.clone() || undefined;
    res.recorderDepartment = this.recorderDepartment && this.recorderDepartment.clone() || undefined;
    res.vesselFeatures = this.vesselFeatures && this.vesselFeatures.clone() || undefined;
    return res;
  }

  copy(target: Trip) {
    target.fromObject(this);
  }

  asObject(): any {
    const target:any = Object.assign({}, this);
    delete target.dirty;
    delete target.__typename;
    target.departureLocation = this.departureLocation && this.departureLocation.asObject() || undefined;
    target.returnLocation = this.returnLocation && this.returnLocation.asObject() || undefined;
    target.recorderDepartment = this.recorderDepartment && this.recorderDepartment.asObject() || undefined;
    target.vesselFeatures = this.vesselFeatures && this.vesselFeatures.asObject() || undefined;
    return target;
  }

  fromObject(source:any) {
    super.fromObject(source);
    this.departureDateTime = source.departureDateTime;
    this.returnDateTime = source.returnDateTime;
    this.comments = source.comments;
    this.creationDate = source.creationDate;
    source.departureLocation && this.departureLocation.fromObject(source.departureLocation);
    source.returnLocation && this.returnLocation.fromObject(source.returnLocation);
    source.recorderDepartment && this.recorderDepartment.fromObject(source.recorderDepartment);
    source.vesselFeatures && this.vesselFeatures.fromObject(source.vesselFeatures);
  }
}

export class Person extends Entity<Person> implements Cloneable<Person> {
  firstName: string;
  lastName: string;
  email: string;
  pubkey: string;
  avatar: string;
  creationDate: Date | Moment;
  statusId: number;
  department: Referential;
  profiles: Referential[];

  constructor() {
    super();
    this.department = new Referential();
  }
  
  clone(): Person {
    const target = new Person();
    this.copy(target);
    return target;
  }

  copy(target: Person) {
    Object.assign(target, this);
    target.department = this.department.clone();
    target.profiles =  this.profiles && this.profiles.map(p => p.clone()) || undefined;
  }

  asObject(): any {
    const target:any = super.asObject();
    delete target.dirty;
    delete target.__typename;
    target.department = this.department && this.department.asObject() || undefined;
    target.profiles = this.profiles && this.profiles.map(p => p.asObject()) || undefined;
    return target;
  }

  fromObject(source:any) {
    super.fromObject(source);
    this.firstName = source.firstName;
    this.lastName = source.lastName;
    this.email = source.email;
    this.creationDate = source.creationDate;
    this.pubkey = source.pubkey;
    this.avatar = source.avatar;
    this.statusId = source.statusId;
    source.department && this.department.fromObject(source.department);
    this.profiles = source.profiles && source.profiles.map(p => {
      const res = new Referential();
      res.fromObject(p);
      return res;
    }) || undefined;
  }
}


export class UserSettings extends Entity<UserSettings> implements Cloneable<UserSettings> {
  locale: string;

  clone(): UserSettings {
    const res = Object.assign(new UserSettings(), this);
    return res;
  }

  asObject(): any {
    const res:any = super.asObject();
    delete res.dirty;
    delete res.__typename;
    return res;
  }

  fromObject(source:any) {
    super.fromObject(source);
    this.locale = source.locale;
  }
}

/** 
 * An user account
 */
export class Account extends Person {
  settings: UserSettings;

  constructor() {
    super();
    this.settings = new UserSettings();
  }  

  clone(): Account {
    const target = new Account();
    super.copy(target);
    return target;
  }

  copy(target: Account): Account {
    super.copy(target);
    target.settings = this.settings && this.settings.clone() || undefined;
    return target;
  }

  asObject(): any {
    const target:any = super.asObject();
    target.settings = this.settings && this.settings.asObject() || undefined;
    return target;
  }

  fromObject(source:any) {
    super.fromObject(source);
    source.settings && this.settings.fromObject(source.settings);
  }
}
