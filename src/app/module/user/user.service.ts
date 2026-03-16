
import status from "http-status";
import AppError from "../../../errorHelpers/AppError";
import { Role, Specialty } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload, ICreateDoctorPayload } from "./user.interface";


//create doctor
const createDoctor = async (payload: ICreateDoctorPayload) => {
  const specialties: Specialty[] = [];
  //is specailty exist? validation
  for (const specialtyId of payload.doctor.specialties) {
    const specialty = await prisma.specialty.findUnique({
      where: {
        id: specialtyId,
      },
    });
    if (!specialty) {
      throw new AppError(status.NOT_FOUND,`specialty with id ${specialtyId} not found`);
    }
    specialties.push(specialty);
  }

  //is the user exist?
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });
  if (userExists) {
    throw new AppError(status.CONFLICT,`User with this email already exist`);
  }

  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      name: payload.doctor.name,
      needPasswordChange: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const { specialties: _, ...doctorDetails } = payload.doctor;
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...doctorDetails,
        },
      });

      const doctorSpecialtyData = specialties.map((specialty) => {
        return {
          doctorId: doctorData.id,
          specialtyId: specialty.id,
        };
      });

      await tx.doctorSpecialty.createMany({
        data: doctorSpecialtyData,
      });

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              status: true,
              emailVerified: true,
              image: true,
              isDeleted: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          specialties: {
            select: {
              specialty: {
                select: {
                  title: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      return doctor
    });

    return result;
  } catch (error: any) {
    console.log("Transaction Error:", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};


//create admin 

const createAdmin = async (payload: ICreateAdminPayload) => {
    //TODO: Validate who is creating the admin user. Only super admin can create admin user and only super admin can create super admin user but admin user cannot create super admin user

    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.admin.email
        }
    })

    if (userExists) {
        throw new AppError(status.CONFLICT, "User with this email already exists");
    }

    const { admin, role, password } = payload;



    const userData = await auth.api.signUpEmail({
        body: {
            ...admin,
            password,
            role,
            needPasswordChange: true,
        }
    })

    try {
        const adminData = await prisma.admin.create({
            data: {
                userId: userData.user.id,
                ...admin,
            }
        })

        return adminData;


    } catch (error: any) {
        console.log("Error creating admin: ", error);
        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        })
        throw error;
    }


}







export const UserService = {
    createDoctor,
    createAdmin
}
