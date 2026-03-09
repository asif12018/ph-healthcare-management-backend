


//create doctor

import { prisma } from "../../lib/prisma";




const getAllDoctors = async()=>{
    const doctors = await prisma.doctor.findMany({
        include:{
            user: true,
            specialties:{
                include:{
                    specialty: true
                }
            }
        }
    });

    return doctors
}

//get doctor by id

const getDoctorById = async(id: string)=>{
    const doctor = await prisma.doctor.findUnique({
        where: {
            id: id
        },
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    });
    return doctor
}



export const DoctorService = {
    getAllDoctors,
    getDoctorById
}