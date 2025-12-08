<template>
    <div class="row g-0 overflow-hidden">
        <div class="col col-sm">
            <div class="h1 text-center">遇到的寶可夢屬性</div>
            <button class="col-6 fs-2" v-for="(selectedType, index) in selectedTypes"
                :key="index" @click="deleteType(index)"
                v-show="types[selectedType.type] != null"
                :style="{'background-color': selectedType.type !== -1 ? types[selectedType.type].typeColor : ''}">
                {{ types[selectedType.type] ? types[selectedType.type].typeCH : null }}
            </button>
            <div class="row g-0 justify-content-center">
                <button class="typeImg col-3 border-0 rounded-pill m-1 p-1 fw-bold text-light" :style=" {'background-color':types[index].typeColor ,'background-image':'url('+types[index].typeImg+')'}" v-for="(type, index) in types" :key="type" @click="updateType(index)">{{ type.typeCH }}</button>
            </div>
        </div>

        <div class="col col-sm text-center">
            <div class="row">
                <div class="col-5">
                    <div class="fs-2">效果絕佳</div>
                    <div class="row g-0 justify-content-center" v-for="item in superEffectiveView" :key="item">
                        <div class="col-5" :style="{'background-color': item.color, 'color': 'white'}">{{ item.type }}</div>
                        <div class="col-5" :style="{'background-color': item.color, 'color': 'white'}">{{ item.magnification }}</div>
                    </div>
                </div>
                <div class="col-5">
                    <div class="fs-2">效果不好</div>
                    <div class="row g-0 justify-content-center" v-for="item in weaknessView" :key="item">
                        <div class="col-5" :style="{'background-color': item.color, 'color': 'white'}">{{ item.type }}</div>
                        <div class="col-5" :style="{'background-color': item.color, 'color': 'white'}">{{ item.magnification }}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <!-- <h1>有效果</h1>
                <div class="row g-0" v-for="item in normalView" :key="item">
                    <div class="col">{{ item.type }}</div>
                    <div class="col">{{ item.magnification }}</div>
                </div> -->
                <div class="col-5">
                    <div class="fs-2">沒有效果</div>
                    <div class="row g-0 justify-content-center" v-for="item in noEffectiveView" :key="item">
                        <div class="col-5" :style="{'background-color': item.color, 'color': 'white'}">{{ item.type }}</div>
                        <div class="col-5" :style="{'background-color': item.color, 'color': 'white'}">{{ item.magnification }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 使用招式的倍率 noEffective = 0 , weakness = 0.5 , superEffective = 2
            types: [
                { typeImg: '../PokemonTypeFightingData/Normal.png', typeColor:'rgb(144,153,161)', typeEN: 'Normal', typeCH: '一般', noEffective: [13], superEffective: [6] },
                { typeImg: '../PokemonTypeFightingData/Fire.png', typeColor:'rgb(232,39,38)', typeEN: 'Fire', typeCH: '火', weakness: [1, 4, 5, 11, 16, 17], superEffective: [2, 8, 12] },
                { typeImg: '../PokemonTypeFightingData/Water.png', typeColor:'rgb(42,129,239)', typeEN: 'Water', typeCH: '水', weakness: [1, 2, 5, 16], superEffective: [3, 4] },
                { typeImg: '../PokemonTypeFightingData/Electric.png', typeColor:'rgb(252,194,2)', typeEN: 'Electric', typeCH: '電', weakness: [3, 9, 16], superEffective: [8] },
                { typeImg: '../PokemonTypeFightingData/Grass.png', typeColor:'rgb(66,159,45)', typeEN: 'Grass', typeCH: '草', weakness: [2, 3, 4, 8], superEffective: [1, 5, 7, 9, 11] },
                { typeImg: '../PokemonTypeFightingData/Ice.png', typeColor:'rgb(60,218,250)', typeEN: 'Ice', typeCH: '冰', weakness: [5], superEffective: [1, 6, 12, 16] },
                { typeImg: '../PokemonTypeFightingData/Fighting.png', typeColor:'rgb(253,129,6)', typeEN: 'Fighting', typeCH: '格鬥', weakness: [11, 12, 15], superEffective: [9, 10, 17] },
                { typeImg: '../PokemonTypeFightingData/Poison.png', typeColor:'rgb(143,66,202)', typeEN: 'Poison', typeCH: '毒', weakness: [4, 6, 7, 11, 17], superEffective: [8, 10] },
                { typeImg: '../PokemonTypeFightingData/Ground.png', typeColor:'rgb(145,81,32)', typeEN: 'Ground', typeCH: '地面', noEffective: [3], weakness: [7, 12], superEffective: [2, 4, 5] },
                { typeImg: '../PokemonTypeFightingData/Flying.png', typeColor:'rgb(129,186,237)', typeEN: 'Flying', typeCH: '飛行', noEffective: [8], weakness: [4, 6, 11], superEffective: [3, 5, 12] },
                { typeImg: '../PokemonTypeFightingData/Psychic.png', typeColor:'rgb(243,63,119)', typeEN: 'Psychic', typeCH: '超能力', weakness: [6, 10], superEffective: [11, 13, 15] },
                { typeImg: '../PokemonTypeFightingData/Bug.png', typeColor:'rgb(144,161,23)', typeEN: 'Bug', typeCH: '蟲', weakness: [4, 6, 8], superEffective: [1, 9, 12] },
                { typeImg: '../PokemonTypeFightingData/Rock.png', typeColor:'rgb(179,169,132)', typeEN: 'Rock', typeCH: '岩石', weakness: [0, 1, 7, 9], superEffective: [2, 4, 6, 8, 16] },
                { typeImg: '../PokemonTypeFightingData/Ghost.png', typeColor:'rgb(111,65,112)', typeEN: 'Ghost', typeCH: '幽靈', noEffective: [0, 6], weakness: [7, 11], superEffective: [13, 15] },
                { typeImg: '../PokemonTypeFightingData/Dragon.png', typeColor:'rgb(78,97,224)', typeEN: 'Dragon', typeCH: '龍', weakness: [1, 2, 3, 4], superEffective: [5, 14, 17] },
                { typeImg: '../PokemonTypeFightingData/Dark.png', typeColor:'rgb(80,65,61)', typeEN: 'Dark', typeCH: '惡', noEffective: [10], weakness: [13, 15], superEffective: [6, 11, 17] },
                { typeImg: '../PokemonTypeFightingData/Steel.png', typeColor:'rgb(96,161,187)', typeEN: 'Steel', typeCH: '鋼', noEffective: [7], weakness: [0, 4, 5, 9, 10, 11, 12, 14, 16, 17], superEffective: [1, 6, 8] },
                { typeImg: '../PokemonTypeFightingData/Fairy.png', typeColor:'rgb(242,109,240)', typeEN: 'Fairy', typeCH: '妖精', noEffective: [14], weakness: [6, 11, 15], superEffective: [7, 16] },
            ],
            selectedTypes: [{ type: -1 }, { type: -1 }],
            typeLimit: 0,

            typeA: 0,
            typeB: 0,
            superEffectiveIntegrate: 0,
            weaknessIntegrate: 0,
            noEffectiveIntegrate: 0,
            allArray: [],
            superEffectiveView: [],
            weaknessView: [],
            // normalView: [],
            noEffectiveView: [],
        };
    },
    methods: {
        updateType(index) {
            // console.log('----------------');
            // console.log('index:'+index);
            if (this.selectedTypes[0].type != index && this.selectedTypes[1].type != index) {
                if (this.typeLimit == 0) {
                    this.selectedTypes[0].type = index;
                    this.typeLimit += 1;
                } else if (this.typeLimit == 1) {
                    this.selectedTypes[1].type = index;
                    this.typeLimit = 0;
                }
            }

            //屬性優劣
            // console.log('----------------');
            try {
                this.typeA = this.selectedTypes[0].type;
                this.typeB = this.selectedTypes[1].type;

                
                // selectedTypes內兩個都有東西
                if (this.selectedTypes[0].type >= 0 && this.selectedTypes[1].type >= 0) {
                    this.superEffectiveIntegrate = (this.types[this.typeA].superEffective || []).concat((this.types[this.typeB].superEffective || [])).sort((a, b) => a - b);
                    this.weaknessIntegrate = (this.types[this.typeA].weakness || []).concat(this.types[this.typeB].weakness).sort((a, b) => a - b);
                    this.noEffectiveIntegrate = (this.types[this.typeA].noEffective || []).concat((this.types[this.typeB].noEffective || [])).sort((a, b) => a - b);
                    this.pushArray(this.superEffectiveIntegrate);
                    this.pushArray(this.weaknessIntegrate);
                    this.pushArray(this.noEffectiveIntegrate);
                // 第一個屬性有東西
                }else if(this.selectedTypes[0].type >= 0 && this.selectedTypes[1].type == -1){
                    this.superEffectiveIntegrate = (this.types[this.typeA].superEffective || []).sort((a, b) => a - b);
                    this.weaknessIntegrate = (this.types[this.typeA].weakness || []).sort((a, b) => a - b);
                    this.noEffectiveIntegrate = (this.types[this.typeA].noEffective || []).sort((a, b) => a - b);
                    this.pushArray(this.superEffectiveIntegrate);
                    this.pushArray(this.weaknessIntegrate);
                    this.pushArray(this.noEffectiveIntegrate);
                // 第二個屬性有東西
                }else if(this.selectedTypes[0].type == -1 && this.selectedTypes[1].type >= 0){ 
                    this.superEffectiveIntegrate = (this.types[this.typeB].superEffective || []).sort((a, b) => a - b);
                    this.weaknessIntegrate = (this.types[this.typeB].weakness || []).sort((a, b) => a - b);
                    this.noEffectiveIntegrate = (this.types[this.typeB].noEffective || []).sort((a, b) => a - b);
                    this.pushArray(this.superEffectiveIntegrate);
                    this.pushArray(this.weaknessIntegrate);
                    this.pushArray(this.noEffectiveIntegrate);
                }
                
                // 整合計算
                const res = Object.values(this.allArray.reduce((a, b) => {
                    const key = b.type;
                    a[key] = a[key] || { type: b.type, magnification: 1, color: b.color};

                    // 將att轉為數字，然後相乘
                    a[key].magnification *= b.magnification;

                    return a;
                }, {}));
                this.allArray = res;
                this.superEffectiveView = this.allArray.filter(e => e.magnification >= 2).sort((a, b) => b - a);
                // console.log(this.superEffectiveView)
                this.weaknessView = this.allArray.filter(e => e.magnification < 1 && e.magnification > 0).sort((a, b) => b - a);
                // console.log(this.weaknessView)
                // this.normalView = this.allArray.filter(e => e.magnification == 1).sort((a, b) => b - a);
                // console.log(this.noEffectiveView)
                this.noEffectiveView = this.allArray.filter(e => e.magnification == 0).sort((a, b) => b - a);
                // console.log(this.noEffectiveView)
                this.allArray = [];


            } catch (error) {
                console.log('有錯誤');
                console.log(error);
                return;
            }

        },
        deleteType(index) {
            this.selectedTypes[index].type = -1;
            this.allArray = [];
            this.updateType(-1);
        },
        pushArray(data){
            let magnification = 1;
            if (data === this.superEffectiveIntegrate) {
                magnification = 2;
            } else if (data === this.weaknessIntegrate) {
                magnification = 0.5;
            } else if (data === this.noEffectiveIntegrate) {
                magnification = 0;
            }
            data.forEach((value) => {
                this.allArray.push({ 
                    type: this.types[value].typeCH, 
                    magnification: magnification,
                    color: this.types[value].typeColor
                });
            });
        },

    },
}
</script>

<style>
.typeImg{
    background-repeat: no-repeat;
    background-position-y: center;
    background-position-x: 5px;
    background-size: 20%;
}
</style>