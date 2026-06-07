import {Table,Model,DataType,Column, PrimaryKey, AllowNull, Validate} from "sequelize-typescript";
import { OrderStatus } from "../../globals/types";

@Table({
    tableName:"orders",
    modelName:"Order",
    timestamps: true
})

class Order extends Model{

    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    declare id : string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            len: {
            args: [10,10],
            msg: "Phone number must be 10 digits"
            }
        }
    })
    declare phoneNumber: string

    @Column({
        type: DataType.STRING,
    })
    declare AddressLine: string

    @Column({
        type: DataType.STRING
    })
    declare city: string

    @Column({
        type: DataType.STRING
    })
    declare state: string

    @Column({
        type: DataType.STRING
    })
    declare zipCode: string

    @Column({
        type: DataType.FLOAT,
        allowNull: false
    })
    declare totalAmount: number

    @Column({
        type:DataType.ENUM(OrderStatus.Pending,OrderStatus.Cancelled,OrderStatus.Delivered,OrderStatus.Ontheway,OrderStatus.Preparation),
        defaultValue:OrderStatus.Pending
    })
    declare OrderStatus: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "Anonymous"
    })
    declare firstName: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "Anonymous"
    })
    declare lastName: string

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "anonymous@gmail.com"
    })
    declare email: string

}
export default Order