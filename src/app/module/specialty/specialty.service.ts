
//create specialty

import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";



const createSpecialty = async(payload: Specialty): Promise<Specialty>=>{
      const specialty = await prisma.specialty.create({
        data: payload
      });

      return specialty
}

//get all specialty

const getAllSpecialty = async(): Promise<Specialty[]>=>{
    const specialties = await prisma.specialty.findMany();
    return specialties
}

//delete specialty

const deleteSpecialty = async(id:string): Promise<Specialty>=>{
    const specialty = await prisma.specialty.update({
        where: {
            id: id
        },
        data: {
            isDeleted: true
        }
    });
    return specialty
}


//update specialty

const updateSpecialty = async(id:string, payload: Specialty): Promise<Specialty>=>{
    const specialty = await prisma.specialty.update({
        where: {
            id: id
        },
        data: payload
    });
    return specialty
}







export const  SpecialtyService = {
    createSpecialty,
    getAllSpecialty,
    deleteSpecialty,
    updateSpecialty
}