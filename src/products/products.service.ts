import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger(ProductsService.name);


  async onModuleInit() {
    this.$connect();
    this.logger.log('Connecting to the database 🗃️');
  }

  create(createProductDto: CreateProductDto) {

    return this.product.create(
      {
        data: createProductDto
      }
    );

  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit } = paginationDto;

    const totalPages = await this.product.count(
      {
        where:{
          available:true
        }
      }
    );
    const lastPage = Math.ceil(totalPages / limit);



    return {
      data: await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          available: true
        }
      }),
      metadata: {
        page,
        total: totalPages,
        lastPage
      }
    }

  }

  async findOne(id: number) {

    const product = await this.product.findFirst({
      where: {
        id,
        available: true
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {


    const {id:__,...data} = updateProductDto;//RENOMBRO EL ID PARA SABER QUE NO ESTOY MANDANDO ESOS DATOS A LA HORA DE REALIZAR LA ACTUALIZACION

    await this.findOne(id);

    return this.product.update({
      where: {
        id
      },
      data: data
    });

  }

  async remove(id: number) {

    await this.findOne(id);

    // return this.product.delete({
    //   where: {
    //     id
    //   }
    // });

    const product = await this.product.update({
      where: {
        id
      },
      data: {
        available: false
      }
    });

    return product;

  }
}
