import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UsersEntity } from './users.entity';
import { GroupsEntity } from '../group/group.entity';
import { getRepository } from 'typeorm';
import { validate } from 'class-validator';
import { UsersDTO } from './interfaces/users.dto';
import { UsersRO } from './interfaces/users.ro';
// const studRepository = manager.getRepository(Student);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async showAll(): Promise<UsersRO[]> {
    return await this.usersRepository.find();
  }

  async getAllGroup(idUser: number): Promise<UsersRO> {
    return await this.usersRepository.findOne(idUser, {
      relations: ['groups'],
    });
  }
  async create(user: UsersDTO): Promise<any> {
    const newUser = new UsersEntity();
    newUser.name = user.name;
    newUser.email = user.email;
    newUser.password = user.password;
    // newUser.groups = user.groups;
    // newUser.addresses = user.addresses;
    validate(newUser).then((errors) => {
      // errors is an array of validation errors
      if (errors.length > 0) {
        console.log('validation failed. errors: ', errors);
      } else {
        return this.usersRepository.save(newUser);
      }
    });
  }

  async update(id: number, user: UsersDTO): Promise<UpdateResult> {
    return await this.usersRepository.update(id, user);
  }

  async joinGroup(idUser: number, idGroup: number) {
    const groupRepository = getRepository(GroupsEntity);
    const group: GroupsEntity = await groupRepository.findOne({ id: idGroup });
    const user = await this.usersRepository.findOne({ id: idUser });
    user.groups = [group];
    return await this.usersRepository.save(user);
  }

  async destroy(id: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(id);
  }

  async getOneById(id: number): Promise<UsersRO> {
    return await this.usersRepository.findOne(id);
  }
  async getOneByIdOrFail(id: number): Promise<UsersRO> {
    if ((await this.getOneById(id)) == null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    } else {
      return await this.getOneById(id);
    }
  }

  async deleteUserInGroup(idUser: number, idGroup: number) {
    const groupRepository = getRepository(GroupsEntity);
    const group: GroupsEntity = await groupRepository.findOne({ id: idGroup });
    const user = await this.usersRepository.findOne({ id: idUser });
    // groupRepository.delete({ users: myUser });
    user.groups = [];
    return await this.usersRepository.save(user);
  }
}