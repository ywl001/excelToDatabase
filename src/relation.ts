import { Person } from "./person";

export class Relation {

    private r_huzhu = ['户主', '本人'];
    private r_ernv = ['三女', '三子', '二女', '五女', '五子', '四女', '四子', '长女', '长子', '子', '次子', '独生女', '独生子', '女', '儿子', '女儿'];
    private r_fumu = ['父亲', '母亲'];
    private r_yuefumu = ['岳父', '岳母'];
    private r_gongpo = ['公公', '婆婆'];

    private r_zhizi = ['侄子', '侄女'];
    private r_waisheng = ['外甥', '外甥女']

    private r_sunzi = ['孙女', '孙子'];
    private r_waisun = ['外孙女', '外孙子'];
    private r_xiongdi = ['兄', '弟', '哥'];
    private r_jiemei = ['妹妹', '妹', '姐', '姐姐'];
    private r_xiongdi_wife = ['嫂', '弟媳'];

    private times: number = 0

    /**
     * 孙子的上级
     * */
    private r_zi = ['儿子', '子', '长子', '儿媳', '儿媳妇', '独生子'];

    //孙子的下级
    private r_chongsun = ['重孙', '曾孙子'];

    /**外孙上级 */
    private r_nv = ['女', '女儿', '女婿', '女胥', '二女', '三女', '长女']

    /**外孙下级 */
    private r_chongwaisun = ['重外孙']

    /**父亲上级 */
    private r_zufumu = ['祖父', '祖母']

    /**母亲上级 */
    private r_waizufumu = ['外祖父', '外祖母']

    private r_qizi = '妻';
    private r_zhangfu = '夫';


    run(persons: Person[]) {
        const pmap = this.peoplesToHomeMap(persons);
        const parr = this.execAll(pmap)
        
        if(persons.length != parr.length){
            console.log('after relation length change')
        }
        return parr;
    }

    private execAll(pmap: Map<string, Person[]>) {
        pmap.forEach(value => {
            this.processRelation(value)
        })
        const parr = this.peopleMapToPeoples(pmap);
        console.log("共计设置", this.times);
        return parr
    }

    private peopleMapToPeoples(pmap: Map<string, Person[]>) {
        let parr: Person[] = [];
        pmap.forEach(value => {
            parr = parr.concat(value)
        })
        return parr;
    }


    private processRelation(families: Person[]) {
        const huzhu = families[0];
        if (families.length > 1 && this.isRealtion(huzhu, this.r_huzhu)) {
            for (let i = 0; i < families.length; i++) {
                const p = families[i];
                if (this.isRealtion(p, this.r_huzhu)) {//户主
                    this.huzhu(p, families)
                } else if (this.isRealtion(p, this.r_qizi)) {//妻子
                    this.qizi(p, families)
                } else if (this.isRealtion(p, this.r_zhangfu)) {//丈夫
                    this.zhangfu(p, families)
                } else if (this.isRealtion(p, this.r_xiongdi)) {//兄弟
                    this.xiongdi(p, families)
                } else if (this.isRealtion(p, this.r_jiemei)) {//姐妹
                    this.jiemei(p, families)
                } else if (this.isRealtion(p, this.r_xiongdi_wife)) {//兄弟媳妇嫂子
                    this.xiongdixifu(p, families)
                } else if (this.isRealtion(p, this.r_xiongdi)) {//姐夫妹夫
                    this.jiefumeifu(p, families)
                } else if (this.isRealtion(p, this.r_sunzi)) {//孙子
                    this.sunzi(p, families)
                } else if (this.isRealtion(p, this.r_waisun)) {//外孙
                    this.waisun(p, families)
                } else if (this.isRealtion(p, this.r_zufumu)) {//祖父母
                    this.zufumu(p, families)
                } else if (this.isRealtion(p, this.r_waizufumu)) {//外祖父母
                    this.waizufumu(p, families)
                }
            }
        }
        return families;
    }

    /**
  * 按户号分组保存到map,把数组转成map，户号为key
  */
    private peoplesToHomeMap(peoples: Person[]) {
        let peopleMap = new Map<string, Person[]>();
        peoples.forEach((p) => {
            // console.log(p)
            delete p.id;
            delete p.is_process;
            const key = p.home_number + p.station
            // console.log(key)
            if (!peopleMap.get(key)) {
                peopleMap.set(key, [p]);
            } else {
                //同户内人员多次出现的处理，去除户内重复人员
                let peoples = peopleMap.get(key);
                peoples.push(p)
                // const idx = peoples.findIndex(item => item.pid == p.pid)

                // if (idx == -1) {
                //     //如果人员是户主，把他放到数组第一名
                //     peoples?.push(p)
                // } else {
                //     const p2 = peoples[idx];
                //     //检查如果有父母id，保留下来
                //     this.mergeParentId(p, p2)
                //     //通过更新时间去除重复
                // }
                this.sortByHuzhu(peoples)
            }
        })
        return peopleMap;
    }

    private sortByHuzhu(peoples: Person[]) {
        peoples.sort((a, b) => {
            if (this.isRealtion(a, this.r_huzhu)) {
                return -1
            } else if (this.isRealtion(b, this.r_huzhu)) {
                return 1
            }
            return 0
        })
    }

    //户主
    private huzhu(huzhu: Person, families: Person[]) {
        families.forEach(p => {
            //关系是儿子，设置fatherId
            if (this.isRealtion(p, this.r_ernv)) {
                this.setRelation(huzhu, p)
            }
            //关系是父母，户主设置fatherId或mothier_id
            else if (this.isRealtion(p, this.r_fumu)) {
                this.setRelation(p, huzhu)
            }
        })
    }

    /**
     * 妻子
     * 
    */
    private qizi(qizi: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_ernv)) {
                this.setRelation(qizi, p)
            } else if (this.isRealtion(p, this.r_yuefumu)) {
                this.setRelation(p, qizi)
            }
        })
    }

    // 丈夫
    private zhangfu(zhangfu: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_ernv)) {
                this.setRelation(zhangfu, p)
            } else if (this.isRealtion(p, this.r_gongpo)) {
                this.setRelation(p, zhangfu)
            }
        })
    }

    /**
     * 兄弟
     */
    private xiongdi(brother: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_fumu)) {
                this.setRelation(p, brother)
            } else if (this.isRealtion(p, this.r_zhizi)) {
                this.setRelation(brother, p)
                // console.log('设置侄子', p.pid)
            }
        })
    }

    //姐妹
    private jiemei(jiemei: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_fumu)) {
                this.setRelation(p, jiemei)
            } else if (this.isRealtion(p, this.r_waisheng)) {
                this.setRelation(jiemei, p)
                // console.log('设置外甥', p.pid)
            }
        })
    }

    //弟媳嫂子
    private xiongdixifu(saozidixi: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_zhizi)) {
                this.setRelation(saozidixi, p)
                // console.log('设置侄子', p.pid)
            }
        })
    }

    //姐夫妹夫
    private jiefumeifu(jiefumeifu: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_waisheng)) {
                this.setRelation(jiefumeifu, p)
                // console.log('设置外甥', p.pid)
            }
        })
    }

    //孙子
    private sunzi(sunzi: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_zi)) {
                this.setRelation(p, sunzi)
                // console.log('设置孙子', p.pid)
            } else if (this.isRealtion(p, this.r_chongsun)) {
                this.setRelation(sunzi, p)
                // console.log('设置重孙', p.pid)
            }
        })
    }

    //外孙
    private waisun(waisun: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_nv)) {
                this.setRelation(p, waisun)
                // console.log('设置外孙', waisun.pid)
            } else if (this.isRealtion(p, this.r_chongwaisun)) {
                this.setRelation(waisun, p)
                // console.log('设置重外孙', p.pid)
            }
        })
    }

    //祖父母
    private zufumu(zufumu: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, '父亲')) {
                this.setRelation(zufumu, p)
                // console.log('设置父亲', p.pid)
            }
        })
    }

    //外祖父母
    private waizufumu(waizufumu: Person, families: Person[]) {
        families.forEach(p => {
            if (this.isRealtion(p, '母亲')) {
                this.setRelation(waizufumu, p)
                // console.log('设置母亲', p.pid)
            }
        })
    }

    /**
     * 判断人员是否是一种家庭关系，例如判断人员是不是户主
     * @param p 人员
     * @param relation 关系
     * @returns 
     */
    private isRealtion(p: Person, relation: String[] | String) {
        if (typeof (relation) == 'string') {
            return p.relation == relation;
        } else if (relation instanceof Array) {
            return relation.indexOf(p.relation) > -1;
        }
        return false;
    }

    /**
     * 设置关系
     * @param parent 父母
     * @param child 子女
     */
    private setRelation(parent: Person, child: Person) {
        if (parent.sex == '男' && child.father_id?.length != 18) {
            // console.log('set father id')
            this.times++;
            child.father_id = parent.pid
        } else if (parent.sex == '女' && child.mother_id?.length != 18) {
            // console.log('set mother id')
            this.times++;
            child.mother_id = parent.pid
        }
    }


    private mergeParentId(p1: Person, p2: Person) {
        const fatherId = p1.father_id?.length == 18 ? p1.father_id : p2.father_id;
        const motherId = p1.mother_id?.length == 18 ? p1.mother_id : p2.mother_id;
        p1.father_id = fatherId;
        p1.mother_id = motherId;
        p2.father_id = fatherId;
        p2.mother_id = motherId;
    }

}