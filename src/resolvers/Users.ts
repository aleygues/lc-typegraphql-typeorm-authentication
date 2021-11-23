import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { User } from "../models/User";
import * as argon2 from 'argon2';

@Resolver(User)
export class UsersResolver {
    private userRepo = getRepository(User);

    @Query(() => [User])
    async getUsers(): Promise<User[]> {
        return await this.userRepo.find();
    }

    @Mutation(() => User)
    async signup(@Arg('email') email: string, @Arg('password') password: string): Promise<User> {
        const newUser = this.userRepo.create({
            email,
            password: await argon2.hash(password)
        });
        await newUser.save();
        return newUser;
    }

    @Mutation(() => User, { nullable: true })
    async signin(@Arg('email') email: string, @Arg('password') password: string): Promise<User> {
        const user = await this.userRepo.findOne({ email });

        if(user) {
            if(await argon2.verify(user.password, password)) {
                return user;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}