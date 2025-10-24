import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  ForbiddenException,
  HttpCode,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { prisma as prismaInstance } from '@flowsell/database';
import { PrismaClient } from '@prisma/client';
import type { Response, Request } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreateSequenceDto } from './dto/create-sequence.dto';

const prisma: PrismaClient = prismaInstance;

@Controller('sequences')
@UseGuards(AuthGuard)
export class SequencesController {
  @Get()
  async listSequences(@Req() req: Request, @Res() res: Response) {
    const userId = req.userId;

    if (!userId) {
      return res
        .status(500)
        .send('Erro interno: ID do usuário não encontrado na requisição.');
    }

    try {
      const shopifyStore = await prisma.shopifyStore.findFirst({
        where: { userId: userId },
        select: { id: true },
      });

      if (!shopifyStore) {
        return res.status(404).send('Nenhuma loja da Shopify conectada.');
      }

      const sequences = await prisma.sequence.findMany({
        where: { storeId: shopifyStore.id },
        include: { steps: true },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(sequences);
    } catch (error) {
      console.error('Erro ao listar sequências:', error);
      return res.status(500).send('Erro interno ao buscar sequências.');
    }
  }

  @Post()
  async createSequence(
    @Req() req: Request,
    @Body() createSequenceDto: CreateSequenceDto,
    @Res() res: Response,
  ) {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(500)
        .send('Erro interno: ID do usuário não encontrado.');
    }

    try {
      const shopifyStore = await prisma.shopifyStore.findFirst({
        where: { userId: userId },
        select: { id: true },
      });

      if (!shopifyStore) {
        return res.status(404).send('Nenhuma loja da Shopify conectada.');
      }

      const newSequence = await prisma.sequence.create({
        data: {
          name: createSequenceDto.name,
          storeId: shopifyStore.id,
          steps: {
            createMany: {
              data: createSequenceDto.steps.map((step) => ({
                delayNumber: step.delayNumber,
                delayUnit: step.delayUnit,
                trigger: step.trigger,
                channel: step.channel,
                messageTemplate: step.messageTemplate,
              })),
            },
          },
        },
        include: { steps: true },
      });

      return res.status(201).json(newSequence);
    } catch (error) {
      console.error('Erro ao criar sequência:', error);
      return res.status(500).send('Erro interno ao criar sequência.');
    }
  }

  @Put(':id')
  async updateSequence(
    @Req() req: Request,
    @Param('id') sequenceId: string,
    @Body() updateSequenceDto: CreateSequenceDto,
    @Res() res: Response,
  ) {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(500)
        .send('Erro interno: ID do usuário não encontrado.');
    }

    try {
      const shopifyStore = await prisma.shopifyStore.findFirst({
        where: { userId: userId },
        select: { id: true },
      });
      if (!shopifyStore) {
        throw new NotFoundException('Nenhuma loja da Shopify conectada.');
      }

      const sequence = await prisma.sequence.findUnique({
        where: { id: sequenceId },
        select: { storeId: true },
      });

      if (!sequence) {
        throw new NotFoundException(
          `Sequência com ID ${sequenceId} não encontrada.`,
        );
      }
      if (sequence.storeId !== shopifyStore.id) {
        throw new ForbiddenException(
          'Você não tem permissão para editar esta sequência.',
        );
      }

      const [, updatedSequence] = await prisma.$transaction([
        prisma.sequenceStep.deleteMany({
          where: { sequenceId: sequenceId },
        }),
        prisma.sequence.update({
          where: { id: sequenceId },
          data: {
            name: updateSequenceDto.name,
            steps: {
              createMany: {
                data: updateSequenceDto.steps.map((step) => ({
                  delayNumber: step.delayNumber,
                  delayUnit: step.delayUnit,
                  trigger: step.trigger,
                  channel: step.channel,
                  messageTemplate: step.messageTemplate,
                })),
              },
            },
          },
          include: { steps: true },
        }),
      ]);

      return res.status(200).json(updatedSequence);
    } catch (error) {
      console.error(`Erro ao atualizar sequência ${sequenceId}:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        return res.status(error.getStatus()).send(error.message);
      }
      return res.status(500).send('Erro interno ao atualizar sequência.');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteSequence(
    @Req() req: Request,
    @Param('id') sequenceId: string,
    @Res() res: Response,
  ) {
    const userId = req.userId;
    if (!userId) {
      throw new ForbiddenException('ID do usuário não encontrado.');
    }

    try {
      const shopifyStore = await prisma.shopifyStore.findFirst({
        where: { userId: userId },
        select: { id: true },
      });
      if (!shopifyStore) {
        throw new NotFoundException('Nenhuma loja da Shopify conectada.');
      }

      const sequence = await prisma.sequence.findFirst({
        where: {
          id: sequenceId,
          storeId: shopifyStore.id,
        },
        select: { id: true },
      });

      if (!sequence) {
        throw new NotFoundException(
          `Sequência com ID ${sequenceId} não encontrada ou não pertence a você.`,
        );
      }

      await prisma.sequence.delete({
        where: { id: sequenceId },
      });

      return res.send();
    } catch (error) {
      console.error(`Erro ao deletar sequência ${sequenceId}:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        return res.status(error.getStatus()).send(error.message);
      }
      return res.status(500).send('Erro interno ao deletar sequência.');
    }
  }

  @Get(':id')
  async getSequenceById(
    @Req() req: Request,
    @Param('id') sequenceId: string,
    @Res() res: Response,
  ) {
    const userId = req.userId;
    if (!userId) {
      throw new ForbiddenException('ID do usuário não encontrado.');
    }

    try {
      const shopifyStore = await prisma.shopifyStore.findFirst({
        where: { userId: userId },
        select: { id: true },
      });
      if (!shopifyStore) {
        throw new NotFoundException('Nenhuma loja da Shopify conectada.');
      }

      const sequence = await prisma.sequence.findFirst({
        where: {
          id: sequenceId,
          storeId: shopifyStore.id,
        },
        include: {
          steps: true,
        },
      });

      if (!sequence) {
        throw new NotFoundException(
          `Sequência com ID ${sequenceId} não encontrada ou não pertence a você.`,
        );
      }

      return res.status(200).json(sequence);
    } catch (error) {
      console.error(`Erro ao buscar sequência ${sequenceId}:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        return res.status(error.getStatus()).send(error.message);
      }
      return res.status(500).send('Erro interno ao buscar sequência.');
    }
  }
}
