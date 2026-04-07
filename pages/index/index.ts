// types/index.ts
/** 宠物种类-品种映射类型 */
export interface PetTypeBreedMap {
  [key: string]: string[]; // 种类名: 品种列表
}

/** 宠物信息类型 */
export interface PetInfo {
  petName: string;
  petType: string;
  petBreed: string;
  gender: string;
  birthday: string;
  character?: string; // 选填
}

/** 全局用户信息类型 */
export interface UserInfo {
  phone: string;
  openid?: string;
  petList: PetInfo[];
}