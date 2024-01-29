"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relation = void 0;
class Relation {
    constructor() {
        this.r_huzhu = ['户主', '本人'];
        this.r_ernv = ['三女', '三子', '二女', '五女', '五子', '四女', '四子', '长女', '长子', '子', '次子', '独生女', '独生子', '女', '儿子', '女儿'];
        this.r_fumu = ['父亲', '母亲'];
        this.r_yuefumu = ['岳父', '岳母'];
        this.r_gongpo = ['公公', '婆婆'];
        this.r_zhizi = ['侄子', '侄女'];
        this.r_waisheng = ['外甥', '外甥女'];
        this.r_sunzi = ['孙女', '孙子'];
        this.r_waisun = ['外孙女', '外孙子'];
        this.r_xiongdi = ['兄', '弟', '哥'];
        this.r_jiemei = ['妹妹', '妹', '姐', '姐姐'];
        this.r_xiongdi_wife = ['嫂', '弟媳'];
        this.times = 0;
        /**
         * 孙子的上级
         * */
        this.r_zi = ['儿子', '子', '长子', '儿媳', '儿媳妇', '独生子'];
        //孙子的下级
        this.r_chongsun = ['重孙', '曾孙子'];
        /**外孙上级 */
        this.r_nv = ['女', '女儿', '女婿', '女胥', '二女', '三女', '长女'];
        /**外孙下级 */
        this.r_chongwaisun = ['重外孙'];
        /**父亲上级 */
        this.r_zufumu = ['祖父', '祖母'];
        /**母亲上级 */
        this.r_waizufumu = ['外祖父', '外祖母'];
        this.r_qizi = '妻';
        this.r_zhangfu = '夫';
    }
    run(persons) {
        const pmap = this.peoplesToHomeMap(persons);
        return this.execAll(pmap);
    }
    execAll(pmap) {
        pmap.forEach(value => {
            this.processRelation(value);
        });
        const parr = this.peopleMapToPeoples(pmap);
        console.log("共计设置", this.times);
        return parr;
    }
    peopleMapToPeoples(pmap) {
        let parr = [];
        pmap.forEach(value => {
            parr = parr.concat(value);
        });
        return parr;
    }
    processRelation(families) {
        const huzhu = families[0];
        if (families.length > 1 && this.isRealtion(huzhu, this.r_huzhu)) {
            for (let i = 0; i < families.length; i++) {
                const p = families[i];
                if (this.isRealtion(p, this.r_huzhu)) { //户主
                    this.huzhu(p, families);
                }
                else if (this.isRealtion(p, this.r_qizi)) { //妻子
                    this.qizi(p, families);
                }
                else if (this.isRealtion(p, this.r_zhangfu)) { //丈夫
                    this.zhangfu(p, families);
                }
                else if (this.isRealtion(p, this.r_xiongdi)) { //兄弟
                    this.xiongdi(p, families);
                }
                else if (this.isRealtion(p, this.r_jiemei)) { //姐妹
                    this.jiemei(p, families);
                }
                else if (this.isRealtion(p, this.r_xiongdi_wife)) { //兄弟媳妇嫂子
                    this.xiongdixifu(p, families);
                }
                else if (this.isRealtion(p, this.r_xiongdi)) { //姐夫妹夫
                    this.jiefumeifu(p, families);
                }
                else if (this.isRealtion(p, this.r_sunzi)) { //孙子
                    this.sunzi(p, families);
                }
                else if (this.isRealtion(p, this.r_waisun)) { //外孙
                    this.waisun(p, families);
                }
                else if (this.isRealtion(p, this.r_zufumu)) { //祖父母
                    this.zufumu(p, families);
                }
                else if (this.isRealtion(p, this.r_waizufumu)) { //外祖父母
                    this.waizufumu(p, families);
                }
            }
        }
        return families;
    }
    /**
  * 按户号分组保存到map,把数组转成map，户号为key
  */
    peoplesToHomeMap(peoples) {
        let peopleMap = new Map();
        peoples.forEach((p) => {
            // console.log(p);
            const key = p.home_number + p.station;
            // console.log(key);
            if (!peopleMap.get(key)) {
                peopleMap.set(key, [p]);
            }
            else {
                //同户内人员多次出现的处理，去除户内重复人员
                let peoples = peopleMap.get(key);
                peoples.push(p);
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
                this.sortByHuzhu(peoples);
            }
        });
        return peopleMap;
    }
    sortByHuzhu(peoples) {
        peoples.sort((a, b) => {
            if (this.isRealtion(a, this.r_huzhu)) {
                return -1;
            }
            else if (this.isRealtion(b, this.r_huzhu)) {
                return 1;
            }
            return 0;
        });
    }
    //户主
    huzhu(huzhu, families) {
        families.forEach(p => {
            //关系是儿子，设置fatherId
            if (this.isRealtion(p, this.r_ernv)) {
                this.setRelation(huzhu, p);
            }
            //关系是父母，户主设置fatherId或mothier_id
            else if (this.isRealtion(p, this.r_fumu)) {
                this.setRelation(p, huzhu);
            }
        });
    }
    /**
     * 妻子
     *
    */
    qizi(qizi, families) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_ernv)) {
                this.setRelation(qizi, p);
            }
            else if (this.isRealtion(p, this.r_yuefumu)) {
                this.setRelation(p, qizi);
            }
        });
    }
    // 丈夫
    zhangfu(zhangfu, families) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_ernv)) {
                this.setRelation(zhangfu, p);
            }
            else if (this.isRealtion(p, this.r_gongpo)) {
                this.setRelation(p, zhangfu);
            }
        });
    }
    /**
     * 兄弟
     */
    xiongdi(brother, families) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_fumu)) {
                this.setRelation(p, brother);
            }
            else if (this.isRealtion(p, this.r_zhizi)) {
                this.setRelation(brother, p);
                console.log('设置侄子', p.pid);
            }
        });
    }
    //姐妹
    jiemei(jiemei, families) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_fumu)) {
                this.setRelation(p, jiemei);
            }
            else if (this.isRealtion(p, this.r_waisheng)) {
                this.setRelation(jiemei, p);
                console.log('设置外甥', p.pid);
            }
        });
    }
    //弟媳嫂子
    xiongdixifu(saozidixi, families) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_zhizi)) {
                this.setRelation(saozidixi, p);
                console.log('设置侄子', p.pid);
            }
        });
    }
    //姐夫妹夫
    jiefumeifu(jiefumeifu, families) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_waisheng)) {
                this.setRelation(jiefumeifu, p);
                console.log('设置外甥', p.pid);
            }
        });
    }
    //孙子
    sunzi(sunzi, families) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_zi)) {
                this.setRelation(p, sunzi);
                // console.log('设置孙子', p.pid)
            }
            else if (this.isRealtion(p, this.r_chongsun)) {
                this.setRelation(sunzi, p);
                console.log('设置重孙', p.pid);
            }
        });
    }
    //外孙
    waisun(waisun, families) {
        families.forEach(p => {
            if (this.isRealtion(p, this.r_nv)) {
                this.setRelation(p, waisun);
                // console.log('设置外孙', waisun.pid)
            }
            else if (this.isRealtion(p, this.r_chongwaisun)) {
                this.setRelation(waisun, p);
                console.log('设置重外孙', p.pid);
            }
        });
    }
    //祖父母
    zufumu(zufumu, families) {
        families.forEach(p => {
            if (this.isRealtion(p, '父亲')) {
                this.setRelation(zufumu, p);
                console.log('设置父亲', p.pid);
            }
        });
    }
    //外祖父母
    waizufumu(waizufumu, families) {
        families.forEach(p => {
            if (this.isRealtion(p, '母亲')) {
                this.setRelation(waizufumu, p);
                console.log('设置母亲', p.pid);
            }
        });
    }
    /**
     * 判断人员是否是一种家庭关系，例如判断人员是不是户主
     * @param p 人员
     * @param relation 关系
     * @returns
     */
    isRealtion(p, relation) {
        if (typeof (relation) == 'string') {
            return p.relation == relation;
        }
        else if (relation instanceof Array) {
            return relation.indexOf(p.relation) > -1;
        }
        return false;
    }
    /**
     * 设置关系
     * @param parent 父母
     * @param child 子女
     */
    setRelation(parent, child) {
        var _a, _b;
        if (parent.sex == '男' && ((_a = child.father_id) === null || _a === void 0 ? void 0 : _a.length) != 18) {
            // console.log('set father id')
            this.times++;
            child.father_id = parent.pid;
        }
        else if (parent.sex == '女' && ((_b = child.mother_id) === null || _b === void 0 ? void 0 : _b.length) != 18) {
            // console.log('set mother id')
            this.times++;
            child.mother_id = parent.pid;
        }
    }
    mergeParentId(p1, p2) {
        var _a, _b;
        const fatherId = ((_a = p1.father_id) === null || _a === void 0 ? void 0 : _a.length) == 18 ? p1.father_id : p2.father_id;
        const motherId = ((_b = p1.mother_id) === null || _b === void 0 ? void 0 : _b.length) == 18 ? p1.mother_id : p2.mother_id;
        p1.father_id = fatherId;
        p1.mother_id = motherId;
        p2.father_id = fatherId;
        p2.mother_id = motherId;
    }
}
exports.Relation = Relation;
