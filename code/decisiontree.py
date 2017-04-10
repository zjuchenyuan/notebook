# -*- coding: gbk -*-
#Original From:http://blog.csdn.net/alvine008/article/details/37760639
#compatible both in python2 and python3
#use json to make the output tree look better
import math
import json
import operator
def calcShannonEnt(dataSet):  #计算信息熵
    #calculate the shannon value  
    numEntries = len(dataSet)  
    labelCounts = {}  
    for featVec in dataSet:      #create the dictionary for all of the data  
        currentLabel = featVec[-1]  
        if currentLabel not in labelCounts.keys():  
            labelCounts[currentLabel] = 0  
        labelCounts[currentLabel] += 1  
    shannonEnt = 0.0  
    for key in labelCounts:  
        prob = float(labelCounts[key])/numEntries  
        shannonEnt -= prob*math.log(prob,2) #get the log value  
    return shannonEnt


def splitDataSet(dataSet, axis, value):  #例如axis=0，value=青绿，就会得到数据中青绿的那些样本删去青绿特征的结果
    retDataSet = []  
    for featVec in dataSet:  
        if featVec[axis] == value:      #abstract the fature  
            reducedFeatVec = featVec[:axis]  
            reducedFeatVec.extend(featVec[axis+1:])  
            retDataSet.append(reducedFeatVec)  
    return retDataSet


def chooseBestFeatureToSplit(dataSet):  
    numFeatures = len(dataSet[0])-1  
    baseEntropy = calcShannonEnt(dataSet)  
    bestInfoGain = 0.0; bestFeature = -1  
    for i in range(numFeatures):  
        featList = [example[i] for example in dataSet]  
        uniqueVals = set(featList)  
        newEntropy = 0.0  
        for value in uniqueVals: 
            subDataSet = splitDataSet(dataSet, i , value)  #例如输入i=0,value=青绿，会得到青绿的6条记录的subDataSet
            prob = len(subDataSet)/float(len(dataSet))  
            newEntropy +=prob * calcShannonEnt(subDataSet)  
        infoGain = baseEntropy - newEntropy  
        if(infoGain > bestInfoGain):  
            bestInfoGain = infoGain  
            bestFeature = i  
    return bestFeature


def majorityCnt(classList):  
    classCount = {}  
    for vote in classList:  
        if vote not in classCount.keys(): classCount[vote] = 0  
        classCount[vote] += 1  
    sortedClassCount = sorted(classCount.items(), key=operator.itemgetter(1), reverse=True)  
    return sortedClassCount[0][0]


def createTree(dataSet, labels):  
    classList = [example[-1] for example in dataSet]  #类别列表，每行“是”“否”
    # the type is the same, so stop classify  
    if classList.count(classList[0]) == len(classList):  #数据中全部都是“是”或“否”，return
        return classList[0]  
    # traversal all the features and choose the most frequent feature  
    if (len(dataSet[0]) == 1):#属性为空，返回最多的类别
        return majorityCnt(classList)  
    bestFeat = chooseBestFeatureToSplit(dataSet)  #选择最好的划分特征
    bestFeatLabel = labels[bestFeat]  
    myTree = {bestFeatLabel:{}}  
    del(labels[bestFeat])  
    #get the list which attain the whole properties  
    featValues = [example[bestFeat] for example in dataSet]  
    uniqueVals = set(featValues)  
    for value in uniqueVals:  
        childDataSet = splitDataSet(dataSet, bestFeat, value)
        if childDataSet == []: 
            myTree[bestFeatLabel][value] = majorityCnt(classList)
        else: myTree[bestFeatLabel][value] = createTree(childDataSet, labels[:])  
    return myTree


def classify(inputTree, featLabels, testVec):  
    firstStr = list(inputTree.keys())[0]
    #firstStr = (inputTree.keys())[0]
    secondDict = inputTree[firstStr]
    featIndex = featLabels.index(firstStr)
    for key in secondDict.keys():  
        if testVec[featIndex] == key:  
            if type(secondDict[key]).__name__ == 'dict':  
                classLabel = classify(secondDict[key], featLabels, testVec)  
            else: classLabel = secondDict[key]  
    return classLabel


dataSet = [
"青绿,蜷缩,浊响,清晰,凹陷,硬滑,是".split(','),
"乌黑,蜷缩,沉闷,清晰,凹陷,硬滑,是".split(','),
"乌黑,蜷缩,浊响,清晰,凹陷,硬滑,是".split(','),
"青绿,蜷缩,沉闷,清晰,凹陷,硬滑,是".split(','),
"浅白,蜷缩,浊响,清晰,凹陷,硬滑,是".split(','),
"青绿,稍蜷,浊响,清晰,稍凹,软粘,是".split(','),
"乌黑,稍蜷,浊响,稍糊,稍凹,软粘,是".split(','),
"乌黑,稍蜷,浊响,清晰,稍凹,硬滑,是".split(','),
"乌黑,稍蜷,沉闷,稍糊,稍凹,硬滑,否".split(','),
"青绿,硬挺,清脆,清晰,平坦,软粘,否".split(','),
"浅白,硬挺,清脆,模糊,平坦,硬滑,否".split(','),
"浅白,蜷缩,浊响,模糊,平坦,软粘,否".split(','),
"青绿,稍蜷,浊响,稍糊,凹陷,硬滑,否".split(','),
"浅白,稍蜷,沉闷,稍糊,凹陷,硬滑,否".split(','),
"乌黑,稍蜷,浊响,清晰,稍凹,软粘,否".split(','),
"浅白,蜷缩,浊响,模糊,平坦,硬滑,否".split(','),
"青绿,蜷缩,沉闷,稍糊,稍凹,硬滑,否".split(','),
]
labels = "色泽,根蒂,敲声,纹理,脐部,触感".split(',')  
myTree = createTree(dataSet,labels[:])  
print(json.dumps(myTree,indent=4, ensure_ascii=False))#按缩进4显示这棵树
print(classify(myTree,labels,"青绿,蜷缩,沉闷,稍糊,稍凹,软粘".split(',')))#给定一个未知样本，输出分类结果
