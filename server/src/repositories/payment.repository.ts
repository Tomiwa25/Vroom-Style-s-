import prisma from "../config/database.js";
export const createPayment = async (
    data: {
        orderId: string,
        reference: string,
        amount: number 
    }
) => {
    return prisma.payment.create({
        data: {
            orderId: data.orderId,
            reference: data.reference,
            amount: data.amount,
            status: "PENDING"
        }
    });
};

export const findPaymentByReference = async (
    reference: string
) => {
    return prisma.payment.findUnique({
        where: {
            reference,
        },
        include: {
            order: true,
        },
    });
};

export const updatePaymentSuccess = async (
    reference: string
) => {
    return prisma.payment.update({
        where: {
            reference,
        },
        data: {
            status: "PAID",
            paidAt: new Date()
        },
    });
};

