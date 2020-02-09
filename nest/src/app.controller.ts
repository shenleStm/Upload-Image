import {Controller, Get, Post, Query, Req, Res} from '@nestjs/common';
import { AppService } from './app.service';
import { v4 as uuid} from 'uuid';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/image/list')
  getProductList(@Res() res): void {
    const data = fs.readdirSync('data/images');
    const url = 'http://localhost:8080/images/';
    res.send({
      data: data.map(item => ({
        name: item,
        id: uuid(),
        src: url + item,
      })),
      status: 0,
    });
  }

  @Post('/image/add')
  getImage(@Req() req, @Res() res): void {
    const {imageBase64, name} = req.body;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(`data/images/${name}`, dataBuffer, (err) => {
      if (err) {
        res.send(err);
      } else {
        res.send({status: 0 });
      }
    });
  }

  @Get('/image/delete')
  deleteImage(@Query() query, @Res() res): void {
    const files = fs.readdirSync('data/images');
    const target = files.filter(item => item === query.name);
    if (target) {
      fs.unlinkSync('data/images/' + target);
      res.send({status: 0 });
    }
    res.send({status: 1 });
  }
}
