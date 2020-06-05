(function(Vue){
    Vue.component("todos",{
        watch: {
            todos: {
                handler(todos) {
                    // 存储用组件时，要在window下保存  window.mytodos
                    window.mytodos.storageFunc.save(todos);
                },
                deep:true
            }
        },
        computed: {
            //自定义下拉框
            tips:function(){
                let tips = [];// 存下拉框提示的
                this.todos.forEach((v,i)=>{
                     // 检查v.content 是否有匹配 输入文本的 -1是没有
                    if(v.content.indexOf(this.inputVal) != -1) {
                        tips.push(v.content);
                    }
                })
                return tips;
            },
            //过滤之后的 todos
            filterTodos:function(){
                if(this.visibility == "all"){
                    return this.todos;
                }else if(this.visibility == "active"){
                    return this.todos.filter(function(v,i){
                        return !v.completed;  // 激活项
                    })
                }else{
                    return this.todos.filter(function(v,i){
                        return v.completed; //完成项目
                    })
                }
            },
            // 编辑项目 与 全选 之间的状态绑定
            // 只要有一个编辑项 是false 全选的按钮 就变灰
            allChecked:function(){
                let allChecked = true;  // 默认全选
                this.todos.map(function(v,i){
                    if(!v.completed){
                        allChecked = false;
                    }
                })
                return allChecked;
            },
            remaining:function(){
                let remaining = this.todos.filter((v,i)=>{
                    // 未完成项
                    return !v.completed
                })
                return remaining
            },
            visibility: function(){
               return this.$root.visibility
            },
        },
        data: function() {
            return {
                inputting: false,
                inputVal: "",
                allCheckLabel: false,
                edit_index: -1,  // -1 代表没有在编辑的项
                content_cache: "", //编辑缓存的内容
                todos: window.mytodos.storageFunc.fetch(),
            }
        },
        directives:{
            "focus": {
                inserted: function(el,binding) {
                    el.focus();
                }
            }
        },
        methods: {
            addTodoFromTip:function(tip){
                this.todos.push({
                    content: tip,
                    id:Date.now(),
                    completed:false
                })
                this.inputting = false;
                this.inputVal = "";
            },
            showTips:function(){
                // 表示 顶部输入框 正在输入
                this.inputting = true;
            },
            // 清除已完成
            clearCompletedTodos:function(index){
                // completed == true  已完成
                let un_finish_todos = this.todos.filter(function(v,i){
                    // 未完成的项目
                    return !v.completed
                })
                this.todos = un_finish_todos;
            },
            // 新建 todo 
            saveNewTodo:function(){
                console.log(this.inputVal);
                if(!this.inputVal.trim()){
                    alert("输入不能为空");
                    return;
                }
                this.todos.push({
                    id: Date.now(),
                    content: this.inputVal,
                    completed:false
                })
                // 将输入内容清空
                this.inputVal = "";
            },
            // 移除todo
            removeTodo: function(index){
                this.todos.splice(index,1);
            },
            // todo 全选
            allCheckEvent:function(){
                // 遍历所有的todo 将里面的 completed 设置为 true
                // 默认情况下 allChecked 是 false
                // 点击全选按钮  　allChecked = !allChecked
                this.todos.forEach((v,i)=>{
                    v.completed = !this.allCheckLabel;
                })
                this.allCheckLabel = !this.allCheckLabel
            },
            // 保存编辑项
            // 1. 保存的时候，如果是空的话，直接删除该项
            saveEditTodo:function(index){
                if(!this.todos[index].content){
                    //当输入内容为空，删除该项
                    this.todos.splice(index,1);
                }
                this.edit_index = -1; // 取消编辑状态
            },
            // 编辑待办事项
            editTodo:function(index){
                console.log(index);
                // 保留编辑之前的值
                this.content_cache = this.todos[index].content;
                 // 记录一下当前 编辑的项
                 this.edit_index = index;
            },
            // 取消编辑事件
            cancelEditTodo(index){
                this.todos[index].content = this.content_cache;
                this.content_cache = ""; // 清空编辑 内容的缓存 
                this.edit_index = -1;  //取消编辑
            }
        }, 
        template:`
            <div>
                <div class="app-content">
                    <section class="app-content-top">
                        <section :class="['left',{
                            allcheck:allChecked
                        }]" @click.stop="allCheckEvent"> > </section>
                        <section class="right">
                            <input type="text" v-model="inputVal"
                            @keyup.enter="saveNewTodo"
                            placeholder="输入点啥吧"
                            @input="showTips">
                            <ul :class="['hidden',{show:inputting}]">
                                <li v-for="tip,index in tips"
                                @click.stop="addTodoFromTip(tip)">{{tip}}</li>
                            </ul>
                        </section>
                    </section>
                    <section class="app-content-list">
                        <section class="app-content-liste-item"
                        v-for="item,index in filterTodos">
                            <section class="left">
                                <input type="checkbox" v-model="item.completed">
                            </section>
                            <!-- 代表事项 内容开始 editTodo 双击编辑时间-->
                            <section :class="['middle',{completed:item.completed,
                            hidden:edit_index==index
                            }]"
                            @dblclick.stop="editTodo(index)">{{item.content}}</section>
                            <!-- 待办事项编辑的输入框开始 -->
                            <section :class="['middle','hidden',{show:edit_index==index}]">
                                <input type="text"
                                @keyup.enter="saveEditTodo(index)"
                                @keyup.esc="cancelEditTodo(index)"
                                @blur="saveEditTodo(index)"
                                v-model="item.content">
                            </section>

                            <section class="right" @click.stop="removeTodo(index)"> X </section>
                        </section>
                    </section>
                </div>
                <div class="app-bottom">
                    <section class="app-bottom-left">剩下{{remaining.length}}项</section>
                    <section class="app-bottom-middle">
                        <a href="#/all" :class="['app-bottom-middle-all',{
                            active:visibility == 'all'
                        }]">All</a>
                        <a href="#/active" :class="['app-bottom-middle-active',{
                            active:visibility == 'active'
                        }]">激活</a>
                        <a href="#/finish" :class="['app-bottom-middle-finish',{active:visibility == 'finish'}]">完成</a>
                    </section>
                    <section class="app-bottom-right" @click="clearCompletedTodos">清除已完成</section>
                </div>
            </div>
        ` 
    })
})(Vue)