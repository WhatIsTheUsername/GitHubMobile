/**
 * TrendingPage
 * @flow
 */
'use strict';
import React, {Component} from "react";
import {
    ListView,
    StyleSheet,
    RefreshControl,
    View,
    TouchableHighlight,
    Text,
    Image
} from "react-native";
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view'
import NavigationBar from '../common/NavigationBar'
import ViewUtils from '../util/ViewUtils'
import Popover from "../common/Popover";
import MoreMenu,{MORE_MENU} from '../common/MoreMenu'
import TrendingRepoCell from "../common/TrendingRepoCell";
import RepositoryDetail from "./RepositoryDetail";
import FavoriteDao from "../expand/dao/FavoriteDao";
import CustomTheme from "./my/CustomTheme"
import DataRepository, {FLAG_STORAGE} from '../expand/dao/DataRepository'
import ProjectModel from "../model/ProjectModel";
import TimeSpan from '../model/TimeSpan'
import LanguageDao, {FLAG_LANGUAGE}  from '../expand/dao/LanguageDao'
import {FLAG_TAB} from './HomePage'
import GlobalStyles from '../../res/styles/GlobalStyles'

const API_URL = 'https://github.com/trending/'
var projectModels = [];
var favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_trending)
var dataRepository=new DataRepository(FLAG_STORAGE.flag_trending)
var timeSpanTextArray = [new TimeSpan('Today', 'since=daily'),
new TimeSpan('This Week', 'since=weekly'), new TimeSpan('This Month', 'since=monthly')]

export default class TrendingPage extends Component {
    constructor(props) {
        super(props);
        this.languageDao = new LanguageDao(FLAG_LANGUAGE.flag_language);  //获取language数据
        this.state = { 
            isVisible: false,
            buttonRect: {},
            timeSpan: timeSpanTextArray[0],
            languages: [],
            customThemeViewVisible:false,
            theme: this.props.theme
        };
    }

    //render方法后仅执行一次
    componentDidMount() {
        this.props.homeComponent.addSubscriber(this.onSubscriber);
        this.loadLanguage();
    }
    //组件移除时调用
    componentWillUnmount() {
        this.props.homeComponent.removeSubscriber(this.onSubscriber);
    }

   //底部tab按钮被点击或者theme变化时需要调用的函数，这个函数会被当做参数返回给HomePage
   //当tab按钮被点击回调这个函数时，preTab为前一刻选中的FLAG_TAB,currentTab为当前选中的FLAG_TAB
   //当theme变化调用时，preTab为当前选中的theme,currentTab为空
    onSubscriber = (preTab, currentTab)=> {
        var changedValues = this.props.homeComponent.changedValues;
        if (changedValues.my.themeChange && preTab.styles) {  //theme变化
            this.setState({
                theme: preTab
            })
            return;
        }
        if (currentTab != FLAG_TAB.flag_trendingTab)return;
        //从设置页面切换过来 且language有变
        if (FLAG_TAB.flag_trendingTab === currentTab && changedValues.my.languageChange) {
            this.props.homeComponent.onReStart(FLAG_TAB.flag_trendingTab);
        }
    }
    renderMoreView() {
        let params = {...this.props, theme: this.state.theme,fromPage:FLAG_TAB.flag_trendingTab}
        return <MoreMenu
            {...params}
            ref="moreMenu"
            menus={[MORE_MENU.Sort_Language,MORE_MENU.Custom_Language,MORE_MENU.Custom_Theme,MORE_MENU.About_Author,MORE_MENU.About]}
            contentStyle={{right:20}}
            onMoreMenuSelect={(e)=>{
                if(e==='Custom Theme'){
                    this.setState({customThemeViewVisible: true});
                }
            }}
            anchorView={this.refs.moreMenuButton}
            navigator={this.props.navigator} />
    }
    //弹出时间选择菜单视图
    showPopover() {
        this.refs.button.measure((ox, oy, width, height, px, py) => {
            this.setState({
                isVisible: true,
                buttonRect: {x: px, y: py, width: width, height: height}
            });
        });
    }

    closePopover() {
        this.setState({isVisible: false});
    }

    onSelectTimeSpan(timeSpan) {
        this.closePopover();
        this.setState({
            timeSpan: timeSpan
        })
    }

    loadLanguage() {
        this.languageDao.fetch().then((languages)=> {
            if (languages) {
                this.setState({
                    languages: languages,
                });
            }
        }).catch((error)=> {

        });
    }

    //导航栏标题视图
    renderTitleView() {
        return <View >
            <TouchableHighlight
                ref='button'
                underlayColor='transparent'
                onPress={()=>this.showPopover()}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{
                        fontSize: 18,
                        color: '#FFFFFF',
                        fontWeight: '400'
                    }}>Trending {this.state.timeSpan.showText}</Text>
                    <Image
                        style={{width: 12, height: 12, marginLeft: 5}}
                        source={require('../../res/images/ic_spinner_triangle.png')}
                    />
                </View>
            </TouchableHighlight>
        </View>
    }

    render() {
        let content = this.state.languages.length > 0 ?
            <ScrollableTabView
                tabBarUnderlineColor='#e7e7e7'
                tabBarInactiveTextColor='mintcream'
                tabBarActiveTextColor='white'
                tabBarBackgroundColor={this.state.theme.themeColor}
                ref="scrollableTabView"
                initialPage={0}
                renderTabBar={() => <ScrollableTabBar style={{height: 40,borderWidth:0,elevation:2}} tabStyle={{height: 40}}
                                                      underlineHeight={2}/>}
            >
                {this.state.languages.map((result, i, arr)=> {
                    var language = arr[i];
                    return language && language.checked ?
                        <TrendingTab key={i} {...this.props} timeSpan={this.state.timeSpan} theme={this.state.theme}
                                     tabLabel={language.name}/> : null;
                })}
            </ScrollableTabView>
            : null;
        var statusBar={
            backgroundColor:this.state.theme.themeColor,
        }
        //导航栏
        let navigationBar =
            <NavigationBar
                style={this.state.theme.styles.navBar}
                rightButton={ViewUtils.getMoreButton(()=>this.refs.moreMenu.open())}
                statusBar={statusBar}
                titleView={this.renderTitleView()}/>;  //中间标题
         //时间选择菜单       
        let timeSpanView=
            <Popover
                isVisible={this.state.isVisible}
                fromRect={this.state.buttonRect}
                placement="bottom"
                onClose={()=>this.closePopover()}
                contentStyle={{opacity:0.82,backgroundColor:'#343434'}}
                style={{backgroundColor: 'red'}}>
                <View style={{alignItems: 'center'}}>
                    {timeSpanTextArray.map((result, i, arr) => {
                        return <TouchableHighlight key={i} onPress={()=>this.onSelectTimeSpan(arr[i])}
                                                   underlayColor='transparent'>
                            <Text
                                style={{fontSize: 18,color:'white', padding: 8, fontWeight: '400'}}>
                                {arr[i].showText}
                            </Text>
                        </TouchableHighlight>
                    })
                    }
                </View>
            </Popover>
        //主题选择视图
        let customThemeView=
            <CustomTheme
                visible={this.state.customThemeViewVisible}
                {...this.props}
                onClose={()=>{this.setState({customThemeViewVisible:false})}}/>
        return (
            <View style={styles.container}>
                {/*导航栏*/}
                {navigationBar}  
                {/*内容显示区域*/}
                {content}   
                {/*时间选择菜单*/}
                {timeSpanView}
                {/*主题风格选择视图*/}
                {customThemeView}
                {/*导航栏更多选择视图*/}
                {this.renderMoreView()}
            </View>
        );
    }

}


class TrendingTab extends Component {
    constructor(props) {
        super(props);
        this.isRender = true;  //标识是否需要重新渲染UI
        this.state = {
            isLoading: false,   
            isLodingFail: false,
            favoritKeys: [],
            items: [],
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2)=>row1 !== row2,
            }),
            filter: '',
            theme:this.props.theme,
        };
    }

    //render之后仅调用一次
    componentDidMount() {
        this.props.homeComponent.addSubscriber(this.onSubscriber); //添加回到函数
        this.loadData(this.props.timeSpan,true);  //加载数据
    }

    //组件卸载的时候调用
    componentWillUnmount() {
        this.props.homeComponent.removeSubscriber(this.onSubscriber);  //移除回调函数
    }

    
    //底部tab按钮被点击或者theme变化时需要调用的函数，这个函数会被当做参数返回给HomePage
   //当tab按钮被点击回调这个函数时，preTab为前一刻选中的FLAG_TAB,currentTab为当前选中的FLAG_TAB
   //当theme变化调用时，preTab为当前选中的theme,currentTab为空
    onSubscriber = (preTab, currentTab)=> {
        var changedValues = this.props.homeComponent.changedValues;
        if(changedValues.my.themeChange)this.isRender=true;   //theme变化
        if (changedValues.my.themeChange && preTab.styles) {
            this.setState({
                theme: preTab
            })
            this.updateFavorite();//更新favoriteIcon的颜色
            return;
        }
        if (currentTab != FLAG_TAB.flag_trendingTab)return;  //选中的不是当前页面的tab
        if (FLAG_TAB.flag_favoriteTab === preTab && changedValues.favorite.trendingChange) {//从收藏页面切换过来,且Trending收藏有改变
            // changedValues.favorite.trendingChange = false;
            this.updateFavorite();   //更新favoriteIcon的状态
        }

    }

    //组件在重新渲染之前会调用这个函数
    shouldComponentUpdate(nextProps, nextState) {
        if (this.isRender) {
            this.isRender = false;
            return true;
        } else {
            return false;
        }
    }

   //当组件收到新的props时调用，初始化render时不执行，在这个回调函数里面，可以选择和当前的props进行比较,根据属性的变化，通过调用this.setState()来更新你的组件状态，旧的属性还是可以通过this.props来获取,这里调用更新状态是安全的，并不会触发额外的render调用
    componentWillReceiveProps(nextProps) {//当从当前页面切换走，再切换回来后
        if (nextProps.timeSpan !== this.props.timeSpan) {
            this.loadData(nextProps.timeSpan);
        }
    }

    updateFavorite() {
        this.getFavoriteKeys();
    }

    flushFavoriteState() {//更新ProjectItem的Favorite状态
        projectModels = [];
        var items = this.items;
        //遍历所有item，更新对应item的收藏状态
        for (var i = 0, len = items.length; i < len; i++) {
            projectModels.push(new ProjectModel(items[i], this.checkFavorite(items[i])));
        }
        this.isRender = true;
        //更新状态机
        this.updateState({
            isLoading: false,
            isLodingFail: false,
            dataSource: this.getDataSource(projectModels),
        });
    }

    getFavoriteKeys() {//获取本地用户收藏的ProjectItem
        favoriteDao.getFavoriteKeys().then((keys)=> {
            if (keys) {
                this.updateState({
                    favoritKeys: keys
                })
            }
            this.flushFavoriteState();  //更新ProjectItem的Favorite状态
        }).catch((error)=> {
            this.flushFavoriteState(); //更新ProjectItem的Favorite状态
            console.log(error);
        });
    }

    genFetchUrl(timeSpan, category) {//objective-c?since=daily
        return API_URL + category + '?' + timeSpan.searchText;
    }

    //加载数据
    loadData(timeSpan,isRefresh) {

        this.updateState({   //更新状态机，刷新页面
            isLoading: true,
            isLoadingFail: false,
        });

        this.isRender = true;
        //获取请求的url
        let url=this.genFetchUrl(timeSpan, this.props.tabLabel);
        //请求数据，会优先请求本地数据，本地数据不存在会请求网络数据
        dataRepository.fetchRepository(url).then((wrapData)=>{
            
            this.items=wrapData&&wrapData.items? wrapData.items:wrapData? wrapData:[]; //给items属性赋值
            this.getFavoriteKeys();    //刷新UI

            //如果是刷新数据，并且数据已经过期，那么需要重新请求数据
            if(isRefresh&&wrapData&&wrapData.date&&!dataRepository.checkDate(wrapData.date))return dataRepository.fetchNetRepository(url);

        }).then((items)=>{

            if(!items||items.length===0)return;
            this.items=items;   //给items属性赋值
            this.getFavoriteKeys();  //刷新UI

        }).catch((error)=>{

            console.log(error);
            this.updateState({
                isLoading: false,
                isLoadingFail: true,
            });

        })
    }

    //下拉刷新事件
    onRefresh() {
        this.loadData(this.props.timeSpan,true);
    }

    getDataSource(items) {
        return this.state.dataSource.cloneWithRows(items);
    }
    updateState(dic){
        if (!this)return;
        this.setState(dic);
    }

    //cell点击事件
    onSelectRepository(projectModel) {
        var item = projectModel.item;
        this.props.navigator.push({
            title: item.fullName,
            component: RepositoryDetail,
            params: {
                projectModel: projectModel,
                parentComponent: this,
                flag: FLAG_STORAGE.flag_trending,
                ...this.props
            },
        });
    }

    //favoriteIcon单击回调函数
    onFavorite(item, isFavorite) {
        if (isFavorite) {    
            favoriteDao.saveFavoriteItem(item.fullName, JSON.stringify(item));
        } else {
            favoriteDao.removeFavoriteItem(item.fullName);
        }
    }

    checkFavorite(item) {//检查该Item是否被收藏
        for (var i = 0, len = this.state.favoritKeys.length; i < len; i++) {
            if (item.fullName === this.state.favoritKeys[i]) {
                return true;
            }
        }
        return false;
    }

    //返回cell
    renderRow(projectModel, sectionID, rowID) {
        let {navigator}=this.props;
        return (
            <TrendingRepoCell
                key={projectModel.item.fullName}
                onSelect={()=>this.onSelectRepository(projectModel)}   //设置cell点击事件
                projectModel={projectModel}
                theme={this.state.theme}
                {...{navigator}}
                onFavorite={(item, isFavorite)=>this.onFavorite(item, isFavorite)}/>  //设置收藏按钮点击事件
        );
    }

    render() {
        var content =
            <ListView
                ref="listView"
                style={styles.listView}
                renderRow={(e)=>this.renderRow(e)}
                renderFooter={()=> {
                    return <View style={{height: 50}}/>
                }}
                enableEmptySections={true}
                dataSource={this.state.dataSource}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isLoading}
                        onRefresh={()=>this.onRefresh()}
                        tintColor={this.props.theme.themeColor}
                        title="Loading..."
                        titleColor={this.props.theme.themeColor}
                        colors={[this.props.theme.themeColor, this.props.theme.themeColor, this.props.theme.themeColor]}
                    />}
            />;
        return (
            <View style={GlobalStyles.listView_container}>
                {content}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listView: {
        // marginTop:-20,
    },
});
