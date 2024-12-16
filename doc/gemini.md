探索 Gemini API 的视觉功能

Python Node.js Go REST

试用 Colab 笔记本
在 GitHub 上查看笔记本
Gemini API 能够处理图片和视频，支持开发者实现各种令人兴奋的用例。Gemini 的视觉功能包括：

为图片添加文字说明并回答有关图片的问题
转写和推理 PDF，包括长文档（上下文窗口高达 200 万个 token）
描述、细分和提取视频中的信息，包括长达 90 分钟的视频画面和音频
检测图片中的对象并返回其边界框坐标
本教程演示了使用图片和视频输入向 Gemini API 提示的一些可能方法，提供了代码示例，并简要介绍了使用多模态视觉功能提示的最佳实践。所有输出均为文本。

开始前须知：设置项目和 API 密钥
在调用 Gemini API 之前，您需要设置项目并配置 API 密钥。

 展开即可查看如何设置项目和 API 密钥

提示： 如需查看完整的设置说明，请参阅 Gemini API 快速入门。
获取 API 密钥并保护其安全
您需要 API 密钥才能调用 Gemini API。如果您还没有 API 密钥，请在 Google AI Studio 中创建一个。

获取 API 密钥

强烈建议不要将 API 密钥签入版本控制系统。

您应将 API 密钥存储在 Secret 存储区（例如 Google Cloud Secret Manager）中。

本教程假定您将 API 密钥作为环境变量进行访问。

安装 SDK 软件包并配置 API 密钥
注意 ：本部分介绍了本地 Python 环境的设置步骤。如需安装依赖项并为 Colab 配置 API 密钥，请参阅“身份验证快速入门”记事本
适用于 Gemini API 的 Python SDK 包含在 google-generativeai 软件包中。

使用 pip 安装依赖项：


pip install -U google-generativeai
导入该软件包并使用您的 API 密钥配置服务：


import os
import google.generativeai as genai

genai.configure(api_key=os.environ['API_KEY'])
使用图片提示
在本教程中，您将使用 File API 或作为内嵌数据上传图片，并根据这些图片生成内容。

技术详情（图片）
Gemini 1.5 Pro 和 1.5 Flash 最多支持 3,600 个图片文件。

图片必须是以下图片数据 MIME 类型之一：

PNG - image/png
JPEG - image/jpeg
WEBP - image/webp
HEIC - image/heic
HEIF - image/heif
每张图片相当于 258 个词元。

除了模型的上下文窗口之外，对图片中的像素数量没有具体限制，但较大的图片会被缩小到最大分辨率 3072x3072，同时保留其原始宽高比，而较小的图片会被放大到 768x768 像素。除了带宽之外，缩减图片大小不会降低费用，也不会提高分辨率较高的图片的性能。

为了达到最佳效果，请注意以下事项：

请先将图片旋转到正确方向，然后再上传。
避免使用模糊的图片。
如果使用单张图片，请将文本提示放在图片后面。
图片输入
对于小于 20 MB 的总图片载荷大小，我们建议上传采用 Base64 编码的图片，或直接上传本地存储的图片文件。

Base64 编码的图片
您可以将公开图片网址编码为 Base64 载荷，以便上传。我们建议使用 httpx 库提取图片网址。以下代码示例展示了如何执行此操作：


import httpx
import os
import base64

model = genai.GenerativeModel(model_name = "gemini-1.5-pro")
image_path = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/2560px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg"

image = httpx.get(image_path)

prompt = "Caption this image."
response = model.generate_content([{'mime_type':'image/jpeg', 'data': base64.b64encode(image.content).decode('utf-8')}, prompt])

print(response.text)
多张图片
如需以 Base64 编码格式提示多个图片，您可以执行以下操作：


import httpx
import os
import base64

model = genai.GenerativeModel(model_name = "gemini-1.5-pro")
image_path_1 = "path/to/your/image1.jpeg"  # Replace with the actual path to your first image
image_path_2 = "path/to/your/image2.jpeg" # Replace with the actual path to your second image

image_1 = httpx.get(image_path_1)
image_2 = httpx.get(image_path_2)

prompt = "Generate a list of all the objects contained in both images."

response = model.generate_content([
{'mime_type':'image/jpeg', 'data': base64.b64encode(image_1.content).decode('utf-8')},
{'mime_type':'image/jpeg', 'data': base64.b64encode(image_2.content).decode('utf-8')}, prompt])

print(response.text)
上传一个或多个本地存储的图片文件
或者，您也可以上传一个或多个本地存储的图片文件。


import PIL.Image
import os
import google.generativeai as genai

image_path_1 = "path/to/your/image1.jpeg"  # Replace with the actual path to your first image
image_path_2 = "path/to/your/image2.jpeg" # Replace with the actual path to your second image

sample_file_1 = PIL.Image.open(image_path_1)
sample_file_2 = PIL.Image.open(image_path_2)

#Choose a Gemini model.
model = genai.GenerativeModel(model_name="gemini-1.5-pro")

prompt = "Write an advertising jingle based on the items in both images."

response = model.generate_content([prompt, sample_file_1, sample_file_2])

print(response.text)
请注意，这些内嵌数据调用不包含通过 File API 提供的许多功能，例如获取文件元数据、列出或删除文件。

大型图片载荷
如果您打算发送的文件和系统说明的总大小超过 20 MB，请使用 File API 上传这些文件。

使用 File API 的 media.upload 方法上传任何大小的图片。

注意 ：借助 File API，您最多可为每个项目存储 20 GB 的文件，每个文件的大小上限为 2 GB。文件会存储 48 小时。您可以在该时间段内使用 API 密钥访问这些数据，但无法从 API 下载这些数据。在已推出 Gemini API 的所有地区，此功能均可免费使用。
上传文件后，您可以发出引用 File API URI 的 GenerateContent 请求。选择生成式模型，并为其提供文本提示和上传的图片。


import google.generativeai as genai

myfile = genai.upload_file(media / "Cajun_instruments.jpg")
print(f"{myfile=}")

model = genai.GenerativeModel("gemini-1.5-flash")
result = model.generate_content(
    [myfile, "\n\n", "Can you tell me about the instruments in this photo?"]
)
print(f"{result.text=}")

OpenAI 兼容性
您可以使用 OpenAI 库访问 Gemini 的图片理解功能。这样，您就可以通过更新三行代码并使用 Gemini API 密钥，将 Gemini 集成到现有的 OpenAI 工作流中。如需查看演示如何发送编码为 Base64 载荷的图片的代码，请参阅图片理解示例。

功能
本部分概述了 Gemini 模型的具体视觉功能，包括物体检测和边界框坐标。

获取对象的边界框
Gemini 模型经过训练，可将边界框坐标作为介于 [0, 1] 范围内的相对宽度或高度返回。然后，这些值会乘以 1000 并转换为整数。实际上，这些坐标表示 1000 x 1000 像素版本的图片上的边界框。因此，您需要将这些坐标转换回原始图片的尺寸，以准确映射边界框。


# Choose a Gemini model.
model = genai.GenerativeModel(model_name="gemini-1.5-pro")

prompt = "Return a bounding box for each of the objects in this image in [ymin, xmin, ymax, xmax] format."
response = model.generate_content([sample_file_1, prompt])

print(response.text)
该模型会以 [ymin, xmin, ymax, xmax] 格式返回边界框坐标。如需将这些归一化坐标转换为原始图片的像素坐标，请按以下步骤操作：

将每个输出坐标除以 1000。
将 x 坐标乘以原始图片宽度。
将 y 坐标乘以原始图片高度。
如需探索有关生成边界框坐标并在图片上直观呈现边界框的更详细示例，我们建议您查看我们的对象检测食谱示例。

使用视频提示
在本教程中，您将使用 File API 上传视频，并根据这些图片生成内容。

注意 ：由于视频文件的大小，因此必须使用 File API 上传视频文件。不过，File API 仅适用于 Python、Node.js、Go 和 REST。
技术详情（视频）
Gemini 1.5 Pro 和 Flash 最多支持约 1 小时的视频数据。

视频必须是以下视频格式 MIME 类型之一：

video/mp4
video/mpeg
video/mov
video/avi
video/x-flv
video/mpg
video/webm
video/wmv
video/3gpp
File API 服务会以每秒 1 帧 (FPS) 的速度从视频中提取图片帧，并以 1Kbps 的速度提取单声道音频，每秒添加一次时间戳。这些费率未来可能会发生变化，以便改进推理功能。

注意 ：在 1 FPS 帧采样率下，快速动作序列的细节可能会丢失。请考虑放慢高速剪辑的速度，以提高推理质量。
单个帧为 258 个令牌，音频为每秒 32 个令牌。添加元数据后，每秒视频内容会变成大约 300 个令牌，这意味着 100 万个令牌的上下文窗口只能容纳略低于一小时的视频内容。

如需询问带时间戳的位置，请使用 MM:SS 格式，其中前两位数表示分钟，后两位数表示秒。

为了达到最佳效果，请注意以下事项：

每个提示使用一个视频。
如果使用单个视频，请将文本提示放在视频后面。
使用 File API 上传视频文件
注意 ：借助 File API，您最多可为每个项目存储 20 GB 的文件，每个文件的大小上限为 2 GB。文件会存储 48 小时。您可以在该时间段内使用 API 密钥访问这些数据，但无法使用任何 API 下载这些数据。在所有支持 Gemini API 的地区，此工具均可免费使用。
File API 直接接受视频文件格式。此示例使用了 NASA 的短片“木星的大红斑缩小和变大”。图片来源：戈达德太空飞行中心 (GSFC)/David Ladd（2018 年）。

“Jupiter's Great Red Spot Shrinks and Grows”（木星的大红斑缩小和扩大）属于公共领域，且未展示可识别身份的人物。（NASA 图片和媒体使用指南。）

首先，检索短视频：


wget https://storage.googleapis.com/generativeai-downloads/images/GreatRedSpot.mp4
使用 File API 上传视频并输出 URI。


# Upload the video and print a confirmation.
video_file_name = "GreatRedSpot.mp4"

print(f"Uploading file...")
video_file = genai.upload_file(path=video_file_name)
print(f"Completed upload: {video_file.uri}")
验证文件上传情况并检查状态
通过调用 files.get 方法，验证 API 是否已成功接收文件。

注意 ：视频文件在 File API 中有一个 State 字段。视频上传后，将处于 PROCESSING 状态，直至准备好进行推理。只有 ACTIVE 文件可用于模型推理。

import time

# Check whether the file is ready to be used.
while video_file.state.name == "PROCESSING":
    print('.', end='')
    time.sleep(10)
    video_file = genai.get_file(video_file.name)

if video_file.state.name == "FAILED":
  raise ValueError(video_file.state.name)

包含视频和文字的提示
上传的视频处于 ACTIVE 状态后，您可以发出 GenerateContent 请求来指定该视频的 File API URI。选择生成式模型，并为其提供上传的视频和文本提示。


# Create the prompt.
prompt = "Summarize this video. Then create a quiz with answer key based on the information in the video."

# Choose a Gemini model.
model = genai.GenerativeModel(model_name="gemini-1.5-pro")

# Make the LLM request.
print("Making LLM inference request...")
response = model.generate_content([video_file, prompt],
                                  request_options={"timeout": 600})

# Print the response, rendering any Markdown
Markdown(response.text)
提及内容中的时间戳
您可以使用采用 HH:MM:SS 格式的时间戳来引用视频中的特定时刻。


# Create the prompt.
prompt = "What are the examples given at 01:05 and 01:19 supposed to show us?"

# Choose a Gemini model.
model = genai.GenerativeModel(model_name="gemini-1.5-pro")

# Make the LLM request.
print("Making LLM inference request...")
response = model.generate_content([video_file, prompt],
                                  request_options={"timeout": 600})
print(response.text)
转写视频并提供视觉描述
Gemini 模型可以同时处理音轨和视频帧，从而为视频内容转写并提供视觉描述。对于视频描述，模型以 1 帧/秒 的速率对视频进行采样。此采样率可能会影响说明的详细程度，对于画面快速变化的视频尤其如此。


# Create the prompt.
prompt = "Transcribe the audio from this video, giving timestamps for salient events in the video. Also provide visual descriptions."

# Choose a Gemini model.
model = genai.GenerativeModel(model_name="gemini-1.5-pro")

# Make the LLM request.
print("Making LLM inference request...")
response = model.generate_content([video_file, prompt],
                                  request_options={"timeout": 600})
print(response.text)
列出文件
您可以使用 files.list 列出使用 File API 上传的所有文件及其 URI。


import google.generativeai as genai

print("My files:")
for f in genai.list_files():
    print("  ", f.name)

删除文件
使用 File API 上传的文件会在 2 天后自动删除。您也可以使用 files.delete 手动删除它们。


import google.generativeai as genai

myfile = genai.upload_file(media / "poem.txt")

myfile.delete()

try:
    # Error.
    model = genai.GenerativeModel("gemini-1.5-flash")
    result = model.generate_content([myfile, "Describe this file."])
except google.api_core.exceptions.PermissionDenied:
    pass

后续步骤
本指南介绍了如何使用 File API 上传图片和视频文件，然后根据图片和视频输入生成文本输出。如需了解详情，请参阅以下资源：

文件提示策略：Gemini API 支持使用文本、图片、音频和视频数据进行提示，也称为多模式提示。
系统说明：借助系统说明，您可以根据自己的特定需求和使用情形来控制模型的行为。
安全指南：生成式 AI 模型有时会生成意外的输出，例如不准确、有偏见或令人反感的输出。后处理和人工评估对于限制此类输出造成伤害的风险至关重要。

Object detection with Gemini 1.5 Flash
使用 Gemini 1.5 Flash 进行物体检测
Run in Google Colab
 在 Google Colab 中运行
This notebook introduces object detection with the Gemini API. It's based on a really great example shared by Aishwarya Kamath, with just minor changes. For even more cool examples of what you can do with object detection, check out this neat thread by Alexander Chen, and this interactive demo.
此笔记本介绍了使用 Gemini API 进行对象检测。它基于 Aishwarya Kamath 分享的一个非常好的例子，只有很小的改动。有关您可以使用对象检测执行哪些操作的更多精彩示例，请查看 Alexander Chen 的这个简洁的帖子和这个交互式演示。

You'll learn to perform object detection like this:
您将学习如何执行对象检测，如下所示：



There are many examples, including object detection with
有很多例子，包括

Single and multiple classes (with and without attributes)
单个和多个类（带和不带属性）
Detection and counting 检测和计数
Multiple classes with negatives
具有负数的多个类
Object detection with world knowledge
利用世界知识进行对象检测
Object detection with text on images
图像上文本的对象检测
Visual question answering
视觉问答
Note 注意

This notebook is too large to display on GitHub (open it in Colab and scroll through to see the full output). The notebook has been saved with output as the parsing code is a bit brittle (nothing to do with the Gemini API, that's just how it was written). If you get errors when running, check out how the response is parsed, and edit from there. One could even write another prompt with Gemini, to perfectly parse the output ;)
此笔记本太大，无法在 GitHub 上显示（在 Colab 中打开它并滚动以查看完整输出）。笔记本已与输出一起保存，因为解析代码有点脆弱（与 Gemini API 无关，这就是它的编写方式）。如果您在运行时遇到错误，请查看响应的解析方式，然后从那里进行编辑。甚至可以用 Gemini 编写另一个提示符，以完美地解析输出;)

Install dependencies 安装依赖项

!pip install -U -q "google-generativeai>=0.7.2"
     

from google.colab import drive
import google.generativeai as genai
from PIL import Image

import io
import os
import requests
     
Setup your API key 设置 API 密钥
To run the following cell, your API key must be stored it in a Colab Secret named GOOGLE_API_KEY. If you don't already have an API key, or you're not sure how to create a Colab Secret, see Authentication for an example.
要运行以下单元，您的 API 密钥必须将其存储在名为 GOOGLE_API_KEY 的 Colab Secret 中。如果您还没有 API 密钥，或者不确定如何创建 Colab 密钥，请参阅身份验证有关示例。


from google.colab import userdata
GOOGLE_API_KEY=userdata.get('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)
     
Create a model 创建模型
In some case you might have to lower the safety features, but it should be ok with the examples in this notebook.
在某些情况下，您可能不得不降低安全功能，但对于此笔记本中的示例应该没问题。


model = genai.GenerativeModel(
  model_name='gemini-1.5-flash-002',
)
     
Utils 实用程序
Some plotting and parsing utilities.
一些绘图和解析实用程序。


# @title Plotting Utils
import json
import random
import io
from PIL import Image, ImageDraw
from PIL import ImageColor

additional_colors = [colorname for (colorname, colorcode) in ImageColor.colormap.items()]

def plot_bounding_boxes(im, noun_phrases_and_positions):
    """
    Plots bounding boxes on an image with markers for each noun phrase, using PIL, normalized coordinates, and different colors.

    Args:
        img_path: The path to the image file.
        noun_phrases_and_positions: A list of tuples containing the noun phrases
         and their positions in normalized [y1 x1 y2 x2] format.
    """

    # Load the image
    img = im
    width, height = img.size
    print(img.size)
    # Create a drawing object
    draw = ImageDraw.Draw(img)

    # Define a list of colors
    colors = [
    'red',
    'green',
    'blue',
    'yellow',
    'orange',
    'pink',
    'purple',
    'brown',
    'gray',
    'beige',
    'turquoise',
    'cyan',
    'magenta',
    'lime',
    'navy',
    'maroon',
    'teal',
    'olive',
    'coral',
    'lavender',
    'violet',
    'gold',
    'silver',
    ] + additional_colors

    # Iterate over the noun phrases and their positions
    for i, (noun_phrase, (y1, x1, y2, x2)) in enumerate(
        noun_phrases_and_positions):
        # Select a color from the list
        color = colors[i % len(colors)]

        # Convert normalized coordinates to absolute coordinates
        abs_x1 = int(x1/1000 * width)
        abs_y1 = int(y1/1000 * height)
        abs_x2 = int(x2/1000 * width)
        abs_y2 = int(y2/1000 * height)

        # Draw the bounding box
        draw.rectangle(
            ((abs_x1, abs_y1), (abs_x2, abs_y2)), outline=color, width=4
        )

        # Draw the text
        draw.text((abs_x1 + 8, abs_y1 + 6), noun_phrase, fill=color)

    # Display the image
    img.show()
     

# @title RegionSelector utils
# Adapted from https://colab.research.google.com/drive/1bjGbrtjE_Ugc3YpIvQMtkqsiMPqIp89W#scrollTo=02GJS3Zv4JAu  written by Andreas Steiner and Gabriel Antoine le Roux
import base64
import io

import google.colab.output as output
import IPython
import numpy as np
import PIL

bbox_str = None
bbox_hist = ''

def set_bbox_str(x):
  global bbox_str
  global bbox_hist
  bbox_str = x
  bbox_hist += x + '\n'


output.register_callback('set_bbox_str', set_bbox_str)


class RegionSelector:

  def __init__(self, img):
    src = self._img2src(img)
    IPython.display.display(IPython.display.HTML(r"""
          