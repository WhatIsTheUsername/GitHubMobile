/**
 * PopularPage
 * @flow
 */
'use strict';
import React, {Component} from 'react'
import {
    ListView,
    StyleSheet,
    RefreshControl,
    TouchableHighlight,
    Text,
    Image,
    View,
} from 'react-native'
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view'
import NavigationBar from '../common/NavigationBar'
import ViewUtils from '../util/ViewUtils'
import MoreMenu, {MORE_MENU} from '../common/MoreMenu'
import RepositoryCell from '../common/RepositoryCell'
import RepositoryDetail from './RepositoryDetail'
import FavoriteDao from '../expand/dao/FavoriteDao'
import DataRepository, {FLAG_STORAGE} from '../expand/dao/DataRepository'
import CustomTheme from "./my/CustomTheme"
import SearchPage from "./SearchPage"
import ProjectModel from '../model/ProjectModel'
import {FLAG_TAB} from './HomePage'
import LanguageDao, {FLAG_LANGUAGE}  from '../expand/dao/LanguageDao'
import GlobalStyles from '../../res/styles/GlobalStyles'
import Utils from '../util/Utils'

const API_URL = 'https://api.github.com/search/repositories?q='
const QUERY_STR = '&sort=stars'
var favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular)
var dataRepository = new DataRepository(FLAG_STORAGE.flag_popular)

export default class PopularPage extends Component {
    constructor(props) {
        super(props);
        this.languageDao = new LanguageDao(FLAG_LANGUAGE.flag_key); //实例化语言dao类
        this.state = {
            languages: [],
            customThemeViewVisible: false,
            theme: this.props.theme,  //这个theme是从homePage传过来的
        };
    }

    //render方法后只执行一次
    componentDidMount() {
        //this.props.homeComponent就是HomePage,这里调用HomePage的addSubscriber函数
        //添加 订阅模块，其实就是一个代码块
        this.props.homeComponent.addSubscriber(this.onSubscriber);
        //加载数据
        this.loadLanguage();
    }

    //组件移除时执行
    componentWillUnmount() {
        this.props.homeComponent.removeSubscriber(this.onSubscriber);
    }

    //底部tab按钮被点击或者theme变化时需要调用的函数
    onSubscriber = (preTab, currentTab)=> {
        //获取HomePage的changeValues属性
        var changedValues = this.props.homeComponent.changedValues;
        //如果theme有改动，并且pretab.styles有值，说明theme改动了
        if (changedValues.my.themeChange && preTab.styles) {
            this.setState({   //更新状态机
                theme: preTab
            })
            return;
        }
        //如果点击的是别的tabbarItem,不做操作
        if (currentTab != FLAG_TAB.flag_popularTab)return;
        if (FLAG_TAB.flag_popularTab === currentTab && changedValues.my.keyChange) {//从设置页面切换过来
            this.props.homeComponent.onReStart(FLAG_TAB.flag_popularTab);  //重新加载
        }
    }

    //加载数据
    loadLanguage() {
        this.languageDao.fetch().then((languages)=> {
            if (languages) {
                this.setState({    //更新状态机
                    languages: languages,
                });
            }
        }).catch((error)=> {

        });
    }

    renderMoreButton() {
        return (
            <View style={{flexDirection: 'row',}}>
                <TouchableHighlight
                    ref='button'
                    underlayColor='transparent'
                    onPress={()=>{
                        this.props.navigator.push({
                            component: SearchPage,
                            params: {
                                theme:this.state.theme,
                                ...this.props,
                            },
                        });
                    }}>
                    <View style={{padding:5}}>
                        <Image
                            style={{width: 24, height: 24}}
                            source={require('../../res/images/ic_search_white_48pt.png')}
                        />
                    </View>
                </TouchableHighlight>
                {ViewUtils.getMoreButton(()=>this.refs.moreMenu.open())}
            </View>)
    }

    renderMoreView() {
        let params = {...this.props, theme: this.state.theme,fromPage:FLAG_TAB.flag_popularTab}
        return <MoreMenu
            {...params}
            ref="moreMenu"
            menus={[MORE_MENU.Sort_Key, MORE_MENU.Custom_Key,MORE_MENU.Remove_Key, MORE_MENU.Custom_Theme,MORE_MENU.About_Author,MORE_MENU.About,MORE_MENU.Feedback]}
            contentStyle={{right: 20}}
            onMoreMenuSelect={(e)=> {
                if (e === MORE_MENU.Custom_Theme) {
                    this.setState({customThemeViewVisible: true});
                }
            }}
            anchorView={this.refs.moreMenuButton}
            navigator={this.props.navigator}/>
    }

    render() {

        //内容
        var content = this.state.languages.length > 0 ?
            <ScrollableTabView
                tabBarUnderlineColor='#e7e7e7'  //设置选中时tab下方横线的颜色
                tabBarInactiveTextColor='mintcream'  //设置未选中tab的文字颜色
                tabBarActiveTextColor='white'   //设置选中tab的文字颜色
                tabBarBackgroundColor={this.state.theme.themeColor}   //设置选中tab的背景颜色，使用主题颜色
                ref="scrollableTabView"
                initialPage={0}   //初始化被选中的page页面，默认是0
                //TabBar的样式,这里使用自定义
                renderTabBar={() => <ScrollableTabBar style={{height: 40,borderWidth:0,elevation:2}} tabStyle={{height: 39}}
                                                      underlineHeight={2}/>}
            >
                {this.state.languages.map((result, i, arr)=> {
                    var language = arr[i];
                    return language && language.checked ?
                        <PopularTab key={i} {...this.props} theme={this.state.theme}
                                    tabLabel={language.name}/> : null;
                })}
            </ScrollableTabView>
            : null;



        //导航栏
        var statusBar={
            backgroundColor:this.state.theme.themeColor,
        }
        let navigationBar =
            <NavigationBar
                title='Popular'
                style={this.state.theme.styles.navBar}
                rightButton={this.renderMoreButton()}
                statusBar={statusBar}
                hide={false}/>;



        //custom theme主题选择视图
        let customThemeView =
            <CustomTheme
                visible={this.state.customThemeViewVisible}
                {...this.props}
                onClose={()=> {
                    this.setState({customThemeViewVisible: false})
                }}/>

                
        return (
            <View style={styles.container}>
                {navigationBar} 
                {content} 
                {customThemeView}
                {this.renderMoreView()}
            </View>
        );
    }

}



class PopularTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isLoadingFail: false,
            favoritKeys: [],
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2)=>row1 !== row2,
            }),
            filter: '',
            theme: this.props.theme,
        };
    }

   //底部tab按钮被点击或者theme变化时需要调用的函数，这个函数会被当做参数返回给HomePage
   //当tab按钮被点击回调这个函数时，preTab为前一刻选中的FLAG_TAB,currentTab为当前选中的FLAG_TAB
   //当theme变化调用时，preTab为当前选中的theme,currentTab为空
    onSubscriber = (preTab, currentTab)=> {
        var changedValues = this.props.homeComponent.changedValues;
        if (changedValues.my.themeChange && preTab.styles) {   //theme变化
            this.setState({    //设置新的theme,更新状态机
                theme: preTab
            })
            this.updateFavorite();//更新favoriteIcon
            return;
        }
        if (currentTab != FLAG_TAB.flag_popularTab)return;  //点击了当前对应的tab按钮，忽略
        if (FLAG_TAB.flag_favoriteTab === preTab && changedValues.favorite.popularChange) {//从收藏页面切换过来,且favorite收藏有改变
            // changedValues.favorite.popularChange = false;
            this.updateFavorite(); //更新favoriteIcon
        }

    }

    //render方法后只调用一次
    componentDidMount() {
        // 添加onSubscriber函数
        this.props.homeComponent.addSubscriber(this.onSubscriber);
        // 加载数据
        this.loadData(true);
    }

    //组件被移除的时候调用
    componentWillUnmount() {
        //移除onSubscriber函数
        this.props.homeComponent.removeSubscriber(this.onSubscriber);
    }

    updateFavorite() {
        this.getFavoriteKeys();
    }


    flushFavoriteState() {//更新ProjectItem的Favorite状态
        let projectModels = [];
        let items = this.items;
        for (var i = 0, len = items.length; i < len; i++) {
            projectModels.push(new ProjectModel(items[i], Utils.checkFavorite(items[i],this.state.favoritKeys)));
        }
        this.updateState({
            isLoading: false,
            isLoadingFail: false,
            dataSource: this.getDataSource(projectModels),
        });
    }

    getFavoriteKeys() {//获取本地用户收藏的ProjectItem
        favoriteDao.getFavoriteKeys().then((keys)=> {
            if (keys) {
                this.updateState({favoritKeys: keys});
            }
            this.flushFavoriteState();
        }).catch((error)=> {
            this.flushFavoriteState();
            console.log(error);
        });
    }
    //拼接url
    genFetchUrl(category) {
        return API_URL + category + QUERY_STR;
    }

    //更新状态机
    updateState(dic) {
        if (!this)return;
        this.setState(dic);
    }

    //加载数据
    loadData(isRefresh) {
        this.updateState({   //更新状态机的 isLoading  isLoadingFail
            isLoading: true,
            isLoadingFail: false,
        });
        //获取Url
        let url = this.genFetchUrl(this.props.tabLabel);
        //获取数据
        dataRepository.fetchRepository(url).then((wrapData)=> {
            this.items = wrapData && wrapData.items ? wrapData.items : wrapData ? wrapData : [];
            this.getFavoriteKeys();
            if (isRefresh && wrapData && wrapData.date && !dataRepository.checkDate(wrapData.date))return dataRepository.fetchNetRepository(url);
        }).then((items)=> {
            if (!items || items.length === 0)return;
            this.items = items;
            this.getFavoriteKeys();
        }).catch((error)=> {
            console.log(error);
            this.updateState({
                isLoading: false,
                isLoadingFail: true,
            });
        })
    }

    onRefresh() {
        //刷新数据
        this.loadData(true);
    }

    getDataSource(items) {
        return this.state.dataSource.cloneWithRows(items);
    }

    onSelectRepository(projectModel) {
        var item = projectModel.item;
        this.props.navigator.push({
            title: item.full_name,
            component: RepositoryDetail,
            params: {
                projectModel: projectModel,
                parentComponent: this,
                flag: FLAG_STORAGE.flag_popular,
                ...this.props
            },
        });
    }

    onFavorite(item, isFavorite) {//favoriteIcon单击回调函数
        if (isFavorite) {
            favoriteDao.saveFavoriteItem(item.id.toString(), JSON.stringify(item));
        } else {
            favoriteDao.removeFavoriteItem(item.id.toString());
        }
    }

    //返回一行的数据
    renderRow(projectModel, sectionID, rowID) {
        let {navigator}=this.props;
        return (
            <RepositoryCell
                key={projectModel.item.id}
                onSelect={()=>this.onSelectRepository(projectModel)}
                theme={this.state.theme}
                {...{navigator}}
                projectModel={projectModel}
                onFavorite={(item, isFavorite)=>this.onFavorite(item, isFavorite)} 
            />  
        );
    }

    render() {
        var content =
            <ListView
                ref="listView"
                style={styles.listView}
                renderRow={(e)=>this.renderRow(e)} //每一行
                renderFooter={()=> {                   //底部
                    return <View style={{height: 50}}/>
                }}
                enableEmptySections={true}
                dataSource={this.state.dataSource}  //数据源
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isLoading}  //设置指示器刷新中
                        onRefresh={()=>this.onRefresh()}     //下拉刷新调用onRefresh()方法
                        tintColor={this.props.theme.themeColor}  //设置加载进度指示器的颜色，iOS平台适用
                        title="Loading..."  //iOS平台适用  设置加载进度指示器下面的标题文本信息
                        titleColor={this.props.theme.themeColor}
                        // android平台适用  进行设置加载进去指示器的颜色，至少设置一种，最好可以设置4种
                        colors={[this.props.theme.themeColor, this.props.theme.themeColor, this.props.theme.themeColor]}
                    />}
            />;
        return (
            <View style={[GlobalStyles.listView_container, {paddingTop: 0}]}>
                {content}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
