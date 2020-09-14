'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-91559952.js');

const logo = `iVBORw0KGgoAAAANSUhEUgAAASgAAABQCAYAAACqAegBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjU0RkRGOUM0OUIxNDExRUE5RTNFOUEwOTVGM0FDQTJBIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjU0RkRGOUM1OUIxNDExRUE5RTNFOUEwOTVGM0FDQTJBIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NTRGREY5QzI5QjE0MTFFQTlFM0U5QTA5NUYzQUNBMkEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NTRGREY5QzM5QjE0MTFFQTlFM0U5QTA5NUYzQUNBMkEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6hG31WAAAznklEQVR42uxdB3hUVdo+d1p67yEQAgQCJHQEFBURsaJgWXVVFHvDVcS1uxbcVexlVeyirvqLDRssTYr03iGkEdJ7TyZT/u89996ZyeROZgITl93nfHnOk5k7t5x7ynu+fiS73c4ECRIk6GQknWgCQYIECYASJEiQIAFQggQJEgAlSJAgQQKgBAkSJABKkCBBggRACRIkSJAAKEGCBAmAEiRIkCABUIIECRIAJUiQIEECoAQJEiRIAJQgQYIEQAkSJEiQX8ng7YTpdy3qdMxstbGWlnb20C0T5g/pHxtbUd3MLDY7s9Bxi8XGrFa58O9We4fPFvU3i73zOTbnbxa3e6jfrcpn5+92xzOd19tYOx1HJhlzu+WtNrN1q0GvY93JLCNRKa9uYiOHJLKvXp7+h3bK178eYKu3HGVx0cFMJ0lM0kls96FyVlvfygb1i2HxMSEsNjKIKimxltZ2ZjTomJXa/7JzBjG84pe/7GeJsSGstc3KSioaWWAAdTO9/N4jlSy3sIY/Izw0gKX1imB0GVNT7pRWNrEpE/qy2deO6VCfVrOFXf/wT6yU7oXrdFSf1lYL3d/CP1fXtbIBqVHs61dm8O/utG1fCfttcwG9i44dyK1kU0/rxy4/N+OE2gj9X17VzEKCjGzLnhK2aXcRS0kMY3++KJO3hyu98dlWtnx9HkuMC+Xfq2pbeB2mnpbGP/N3pHdJoHbFe7hSCx1/6KVVrLKmmRnovhlpMSwlIYxV0Pc+SRFdvkcTzZEbH/2Z7ad2H5uVxD589kL/jZElB+id8lmvhFB29oQ0FhRoZIEmPRsyIPaE771o6QG2N7uCjRvWi502MoU1Npv5WDQa9V6vRV+s236MRYYHMBvNQbRraLCJNdE4XbEhjxWWNvA+A6365JoTByi9W2djAJaXNrNxw5MnnjIs+YH6xjYWTA+0uAKHxeb4rIKNXKwEIBId0zOL3krfdUxPx/QcYOhZ+I3uL0k2eg4NQh2fgwQWdg4YcrHRhJIcRUdzS69TP9OvdAEmtY3AKogmZnCgYXh5VdNohntI3ekm+WSRL0uQoJNYxMOC6Fra261Mp5fYZVMHvRtMqA2EtCursGZhrt+Zy7mswzGb4zeggttn/sfkooEX6m/qF9wLIBXIAco4KsCkn9JOIMg4qDEfCwBN4hybIEGCTlKAwsRWC8SIoyX17JKz0m+dOKr34OLyBg4ELvDQ4aMm2b2dZNf4JvlwYyehnsFBBmJJdVzkCwsOWMi5qm5yQ+0Wq4MdFSRI0EkIUHq9jheDQc+aWyCnh0qXnzv49WaSKfmElxzSkKtkpPXF5ZDkVbTqDFqS559dz6RTDcThgbuzQS9Gop7JpE8KDDTOhZhpd+G4vJUGkr2h8xEkSNBJClBQLqMYqdTUtbKrLxw8Py0lIqCiqlnhnjqjhr0r6HHnoOydwcgrn9MFSFntdq4T0xNIQUmHm1kJpIIDDc8YDfpgicnin9dCDzHq9SwrPU6MEkGCTlaAgogETgTi3ND02L6XTc2YW9fYxvUzMlZInZgo3+U9rQslDSZM8um20BeZSKyDRQOf1dNQfwKdwACTfgE/bvde2totLCYyiA31g1VEkCBBPQRQEJlgtoe17srzB78NnUxDk5lJuFI2sck4ovOOSXZfWKDjwDhXgmjHNVZu+ibopQi8riXOqp/VaveqJG9oame9k8JZWkqkGCWCBJ2sAGUy6lllbQs7/4z+Z547sd95dQ1t3KzfgWtSPui6Z8fXYKTsnRHJx1uC04PVjrgk7tLgKi7aVaSlm5lM+s990UA1NLWx/r0jNf16BAkSdJIAFJwVjXqJXTMtcyG+w2nPHT8cwh4YKm8gJXX/R8nFlufxRQhIggINDjcEh0uCw1WBcd8ok0E/nkB3GlwRUFfNPzpubrexAX2iTurOQ1ODM2xptTCI3eB0UbCIoJ8g2v5R1JW/GBY06DFPZAE74YEuyf3qWgT5nzAeYfG3+cl/0KujZiOJc9denDlr6IDYPs0t7dz5UXXK1MH1QCd7OuskmhwSU5wh7S5gYncAhMrJ2PXyGQ6HS73T6VJnp4Gss3GnSxS9TWI23J9e3KYxyLhDJ9UFE0BSAJR7pnNvcqe3ebvVyievToa7f9LnHyWDNj5DuQ6v3BGDE3xpwwBf2rGb1EbFojJ+Bry/TnKAr44DqJU1NLfz9o6PDk7rGxrQPzTEFIFTBvePqTUadEdKKpoKyqubuYd0UIC+g9Qst51E7WTXGhMBGnVqdmdvVdsqBiNAkShE47ogqpe+3WIt00l6b8/oFiYqdXJf4YLdT2xoMjdhLGCs2G3ypfA2523aceHTqhdOafGgbMAACtI4jvNtPp57wmOkB56hVf8gXxgaLEZUWlrbLLaWFgszm62y2uU4FwSvE+vycwffcOUFQz7EZ4eZ3hEeYXfY3JzCmez6rdNLdskm6aw2Kx/AXPkMkLHLg4QXxanSZmNuzp6ss1OnQ2RzskV453YzB56W8IjAINTPVeyUXORQncId2fjg1PcODDe8RoD7F+4pIWnzlQjh8IHQNuf7GaBmU/kcH+DLhXALLA74LHO1zSwkOCJ44qiUewelRf85PiZkqN5FFL12WiZfySqqmvZu2Vf62c4DZa+UVTaZZVCnQaSEyLRS23GRuCNIXULlPY1JmkWlWAVNPC/IZODW0vqGVjZr+rDbacL/XaMlAxZ8tfO0TbuLy0ZmJFC9TbyKVF4+wTYqpzKMitnlWDKV3e7M9rBB8V8u/GHPnYqUz0NkDuVVsbPG9eHOxy6L/cVU3nd7jll5TrlGHcZS+VXj+AQqh9yODaSy3o9j5C9UPnU7NprKUj/ceyqVrW7HVlMZ4O3C4RnxbGBadAuN15KK6uYth/Orf6L2/rmWxogssfgZoPYdqejz6Cu/cTECHuQ6ySnKqQOezw3H4EfMm91Ok+qS2KigXBKnDM10LbgSABUHKw5IMhtoVb7bbLK1TT3Ov/P/MmjZ1Gvou5Upv9PEqqxtrr7ivMHvnjm2z/nVdS0d68acddMpx3HP1KQItmpzwbDPFu9j0RGBndAdX+HzBcOAD4RJ4W9ZMEIFAugA84/V8bgu6NhKyhvZeWf0v+iKczPejQgLSOpqJUuMC82cNmnAc6eO6HXX9yuyb9ny/e6l4CbBTaE/q2paWJ/kcM5ZulCYh/cxqG0j96Nct4P5VYgFGzFn1ilva9XjpY82/e39RTu3DxkQx4KCDDw+UHm/E22zEA91jHY/eNGkAXd8v+Lwgt+3H9sFvSJAOaewhrvNmIwG1uZUW3T57lrcoYfzTR6O+W2c0GIQqVc4axcK9NMzAjWOpfpyb4wJKlERoQHJSXGho2lxuL20onHb8o0Fs39YeXiDxeZkQvwCUFv3ljxNq2Q0iXZ/kRtGZo154xBg6bmooJNZO73cYIEmg46A46r9OZXX9usdxcJDTayNBqbZYpUXY5vEOSE+0Pl3JdTF5hoeIzkASuLnMQWo5OsAKnX1bWxQWkz0lAl9J+H58QiuVTpN71pP5T+uoUkN8ci6cVfRNSaTjtfZva0wYeNighmBni9t2NADonyr3Nk6Vt/UxkorG7lIUlhcx+6/cfzs62dkvd6dm8VEBvW+6bJhS2rqWm59/bOt7w2gPgkkkILeSubM9FwUdhEdtMQpm+s3OMOWUb3iIoONLz4weYnWc5euy/v41YVbnu6bHMH6JIWzmIgglnes1vF+J6R/Y6xGSzpnzF1qk+mRW0/97LJ7vskClx1Fi1J5VRPLK6pjo4cksgonQGm9u1lD3FGp3ZMqxsdjx00kNhm4vqddVmMoi6zFT7fXug/aO/54bkYL5ehrpw1df+Ro9VWffLfnK7jv2H3Uj3qVKcNCTIhGvi8mMrg1ITaURzWjxEZRiQzmvkLRkYG80yPD5RISbGQZabHXhIeYzs/Or+YsNVb/KPqNwIuvYI4iI26HQiIYn5BqQRS56iyK3wPoHvxcun7qaWkrCWSCIPbUN5o511PXYGZgKVFq6lv5SgnuqooKAG7h93ue2nGgtBjv5syS4CwYvCMGx7O+vSJ8acMUf6MTvVskgBP6vqKyRgIpM48CnzE147LugpMrzb1x3LtXnT/kwvziWu4rBiBG+wBsfFeGM75gANigA3vnqfOWRkcGdVLWFRTX7X3opVWz+qVEsuT4MNYnMdyvSnu9XpcQFGiQ4PaCMeJNKduvd2TmzVeMmJ1dUMPRq6ahDdKBTxH6x0t4X+gKeTSGThfgz3t/u+zQrzsPlrMc4q7Rl8yPQe00L4PQpqrKxV/05F2nfzllQtpgWMgx9/zCQaFxaRLbiQ2eExQY9BYsYSqXolMUrepnoLheryhgadD3TgpfUNtQ3ie/qJanq0BqiGhaRS2E+m3t3VtQuL4Jym8bFOJ6nhrklKykSzPSYobjMwYdwAWcF7Ih2NXAYIk4LuKmJBosAFbi6qqXb8h/NiYi2F206WCJCAs2seyjNdxI4IUeo5LWsa4SF8kweYYPiptH3zs4U9HK/WNZZdNSgDbnBl3YAhOBc15R7coGBZQaCHBRH5pgwY/fedrXWhU4XFD925H8mg827y3eT6y1fXhGQiYBw00EsGe6n/vU7NMXbdxdFEFAbobyEhMIVhdfdJiSoq/BxMstrGVP3DXxIWLhz+rEVlhsbXc/8+9JANmQIBP37OdctNnaFfDVH8yrepwWMyu43C4nBg/itjXXNbRZ0F5ltKAAzL3RzZePeOW7ZYcW0AJkDqN6YfEkrpIDXGub/wEKCynarI4Wyvqm1vwdB8ruNsjzSRvQ6J3xO4wa2/aVVifEBP95TGbSRe7nLfhqx1wawwfRrnQOS4oPZcdorGDB16IDuVUvU39D3eKlf2U1DfXt/hzq3/TUGGIsjHwsaxEtQr+UVDT9wscxzUswFsSVh1B7jho3LPlKTeXqdaP/Off5FZN9TS1i8GVQotGaWy1vhwbb7gkOMmRYZc/szkAlMccxgEVsdHDvXgnhfz1aXDcfWRByj9ay2sg2lkScGAZUi9niFaFdJ4Wsf8fkNxOAGCGCfYRsCnyVgkhHYMStf0r6FZtdqZtdsfLR50VLD95QXddqQ04fq4cVHcBypKCW58RpV0z3XdAv7p2MOMVAGgyjSHwgup9KB4DKzq9avHlPyfuD+sVya6O6+sPZNSTQRBNO5gbR8X17R/JV/o6rRz1v0Hd2yvr8x33PLt+Y/xg83o8W13OOljjYHf9el/vp6KFJ8644L+PRDkqTQEPg3Fnjnnv2nd/nALBVs7DR4FvuQnCx+3OrkAdpyo2XDf+H1jl3P7106vb9pVVD+seyclqYRibG83fBO3XRz3U0MV9Hm+/PreTctieOS+LWRxu3EPH+sVo4GPjAGegfvf20T2/7269XEuCzfBLxMBEz0+O487H/OWEdu/aiTLZiQz44zmoCin+inm1miwZA20kKCeIgQwDECqhubz4+9Wn383YfKl/30kebXgJnilhRjDEtx2RXyj1W80JJeVNpsJfAdywoEg1CtAvafij1HwLmPd35SEHNTxt2Fb2NcYzzQgOxqFez0ooG9uvqnHm3Xz3y98TY0PAOBouB8WeNHpoYc+RobZVfRDx+kiTxBmhsbrsVHJUsdklcNOhQFFFMYWm5nJmWEvEsgVqgMkC4YvZwQZXsX0XnmzxMDEkBO3wwK9kU0FJAaQym8cN7PdE7MTwcTqRccW6Vsy3ICe1cEtzZbLzxIIJu2VOye+vekh+x6sh6LKZZUKcaWvUAfNCbgB31pSCZGzo5NiqITRrbhyXHhUpUH6OG/iDBRnVrb7fweuE6fg/i2rjIQgMbYjJY93oSRWiFjDx1ZMrd7vfZdbB8+XPvbngsKgzJ5yLpHvJ94P0Od4v7nlv22M6DZevcr7vgzP739k+NCkUiMvQr12H4YF9Bn9Jiw/qmRIb9fc6kH7XOeeuL7fctXpW9BonTYNpH3RKJIwD35GXRNERHBBpnTBnIoCPDpACoaZVwpa3RRiaj5BifvtBZ41L/dP4Z/ccWlzdyLp64AH7Pnkr7denUQYwWClZB4x51DqU6u44Z9DcWikFpMayJ+uOjb3axL37ax/5298Qt1I+drGZPvLH2MlhCUV3o9bAI1DZ0zf4RF9svItTIn+2pTTHmoLZBosNGEt1PyUrmye+6MhQR4MVjjpvN7XxBCSMuOYHeBYv0O1/t2Pvawq1ztK6jdx2DOeIXgJKUcBYAA7F6a2klWAruhyvGFSCSMx5Ijv8GvawwB1hEhgUa0lKiFnD2XpKdKbEwFpY10OCo56sggEseZC6ACI0l/dZK3AgGn06xytU3trJe8aFxYzITn6qucwEnl8ydzu92h48URKVf1hy5FqBnpOd5AicOULTKNZKcXEmDyhPbrNVOMN2DjR4zOJFPHgCAp3PBFdUQuFbVNnOgVi2MaDesshFhMnABdMcPT56uNbm/XXZwLjJAArAhRqtxiIdyqznLD0fTr37Zf18nJCBObMKIXucBgJHtkAdW223erEY66PTQX68/ds4Kes9Olp4NO4u+efOzra/Cfwz3RbA1woXC6D26Eu/c6sZOH9ObRdI1UdQGsLKqBYtFDP1XdSNwjwDIYCx2h+6dOXYhmFFw38QF0P92rpLoKbru4qF8YXbtQ97X3NIawj//sOIwe/tf29gPyw+z+XMnP0AAMaazRXTzjfuOVJRDNwoDR9bAeJZAgAKLrFett012zYkmIOF644iObdsrLoxnTC0oruXjBgYiWN8hiXQpXdHYhbGqpLyBZ83EmI2PDuFZWVOTI76l8dupcklxoQkAV78AlOJ45QCg2vrWmZwbognGgcjg/M0JVjInhcpjEgxIjZ5Jq0QGb0gABB3nLD+BACwpUKJjjGGCYbBhUgKY2sEK29VsULL1DvcYk5n8LhqinutnlLS/yn+rg5uSgQpWDiju124r/OxATtWemMhgrxYEgAWug7Lcl8GvinUAs1OGJvKVqok7UXrv3GoFpPRKihjcBxMG9a+pb+EDkdjkSe7Xl1Q0ZlPZlZoczkEfzwOXWUGcaVlVI18NM9PjoavbWlrZmON+/ZghSedC1CawJ44kwKNeRK0uGNGConr21D1nvEIr4FiN+uTMnvfvy6FjhF4I7Yc+w8rKtHzNPJm/qA9zCDTAdcVEBvIJ5SgR8uSCuoC4eQYfO/RlV/e2a7BWxJlk3HXNmAewAGUXVPMcZ6FBph4DqGumZSIDLbfGqoYGtBPG5frtx9ibC7eyJWtyWCHVY8Y5gwbc8qcR893vsW1f6Yq3v9j2ESyiAFa888C+0UpiRS9tarPxZwI44mhcgKvt0K5USNLhbfE61UVHcxccHRZYb/fGXG/ljISF9cViRGMJvlDnnpaG5AINNAfbNBY7GxgevwAUn/BKAVCR3FteXd/6JuRZTF6DTgEj/l8OaZCBSnKY8MFxUWN+wBvKJluB8RdgNPA81RgosFZhNZQ9pM0cbNBQkiLm4Z7gFEi8yBrcP3Y6rpHFE7sDjJz/5eMQMTDpkYlh5caCe/EZE9E1CZ92sXLA47nWrVYvQCODEzinUcQ5YaA3tVh8VDrLYA1OChwenr33cAVxKTaecxwK5mQCkJTEsGHu15KIsgaiAXQpWPEw2KGIxj3DggN4bm2stACqY2WNa92vJ85mBLgbzprToOqKgcJgOpRXWULi11ASWe7VApVZj/x0NvJ7A6RrictVRXhMxFazT9ZvC02I9s17ivFu3DkV1kvX0qAUcGPgVrlo6iVWkha1tsP51Wvcj98wPWt+1sC4oH05FVwPhUWlpwhj4+bLR/DxhDGIPi0iCeKDr3eyzxfv44sQng/R7el7zvjJ/Xp63/aHX/7tUvRxAM0lAAd8+QAi3sQ7+XpLLlc/6GTVhXu7okCsA8eLObxkbQ5bv6OIg5k31Q8WCqzh55/enw1MjebvtWx9PnvizTXgCnvRGAjRGLvFWBT8oiRvd1EQSwr6UyXup8rPpMYO5yEvDkU5c1Oay/+B+P37RJ1aUtl4cf6xusXhLlYa/I5keEhvUkocS4Cik+Lpdm3OGDyLIrKNHpr4JSY/BjD3u7LLYTHgROG8yeugioTwyQrQsyXrch8qqmisAsfgq6kbdcKEgxUPz2lvt2tyQZxzogE4msQa6JAaW9odin1fRUNwUnCFwKYIGMDRfWX5HJwC/WYkrqGTKwOJWzmYqCicebdxcZq/H66DgUC1bNbVt3bioMJCTb1p0MLMZEH9Jclz1lJi/Y/ShOj79/sm/awBAPYnXl8z7WBuVcHQ9Dj+PKNdxwEP3B0mZ2OzV/0Tnhxe32i+h97BCrcELZ2Seo+WtvbvSQwuwqQGB1qpbHzgQW8WuGlX8a1llU1Pkuh4lbN/dezhW0/9bPpdX1+WQ5zD6aNTWPf9nH2nSaf04YtIHonim3YVsQ3EObW0Wbm/HRZ+LEzPPzD5OVpUBrlf+8IHG6/JLayp5+1L/dvY1M7OHh9HolIIKyIw91brzAHxD9Dcye2qDyCSR4QFbIgMC9iOubZqcz4bNyyZ183iYc4QI2HFuLnwjAF8wwpsJBFA8w2LK6SiGy/t9bTW4k6c5FZY/fzjZuD2AMSoEYKbiSuZQzLw+1jJHG4GLg6Rrv/RgviflR73HoHbYnAo4LQ6rtJKMIrkGkrjHJnQPQ0dEHclybVDMCjVF7dLigOn8iw1vg8CRjQ1VHZBTeWGnceeh+6CSXafhyC4Pu5DRQVcSLvFqgneAJTRis6lSQGn7pLkon+T45acUEHiWyRNxggNRXtFOrH4MMmrIC7nY5e9dNV6YOUkbrdC4/0iY6ODI9raLFWy1dOzdy9u9/KDU1YRx5bq/tv//Xrw1be/2v4zdv/g1l2dkmY5xMRFCrSbT9wkYxHEWbwG7sIHMTC/qq61iPepHeJlE+tKEqeJXb/whz23uwIU6IwxvS+9/NzBE39dl7tu2uSBfLeWnqQRJPo8+cYaRhwdF62hm8O8gW/W+Wf0H3Pl+YMfdL9m7dbCbz5dvPdrcEs8qgIuMNS20PO1W3yb5H2Swuf4cl58TPCLtBhvx0KHsQBft64Y1ECToXXqhH7czw0SDeqHRZYWpeQ3Hps6d8KIXjPdr9lxoOyX5evz67Hri18Ayt7ZX4X7RhCb9kGvhPCH4qODBnBuhntuMy6yqZyUA6io4JyUhPD4jH6xD+7YX/o8WH9XELIrZnZn3J2TzCQi0CTTZQ2Kfxv3QcfolQBjuyT/l6+1K8p2WSeG72u2Hr0ZeiuIXrZubICAgQAREbMLWw2hDu5uCeAeIwAAgcbjBien0lxiO/aVcWtPoBLYC+4tIS406E/nDe6kIIFS8sCRSuZuDXFf7KCTSooP0dLNBGzfXxJYRpMbIGZQFPVaRBO3t6e6jxqScA61j564TSt0RDZFJ4SoAegmeiKnu7nd2gwuEdwjj7/00u5Ux+HPvvP7kgVf7fj4titH3uD628O3Tvh4yqwvBuw+XA6LWI+mOFi5sYDtoz6DSK4uSnAeBuDM+8uZnUQ7Grctj722+mq+CEnyeIPeleYR65cSxS28/qywxWKrsttltY7BJZjaExEAzab5dglEeDADmG8Xn5UeERUROBghblrXvPLJ5nsgUkJv6hcdlMPXyaXAJImK5x2rvRrfoUtyteK5Ksod/+k8AMvoIYnPkcgS2aLsqdYhO4EyWV1T7+I6WBMy0+P+QZMxCk5vPNe4y154rnvkyW4F8gq+61D573uzK3+IgSwtab+LdlEnq/x8gEAiiYcJxBG4lhRaObg/V5uFnXj2DonragB0AFQUWEXov6TF2dD7S9wHjCapa5HFPgsjzogX3IfaQ2IaCw0BoMTDXVqPH1wH9o3OfPbeMz/G/ntqMDnPtkD1gO6P9UBaEwK9AFgruaWQRHEfxHb9WeNSsT/ebdQWZjeFef+Z07P+CiW1yajT9yRALfs9l4u8cvycHLZVUtkI59n3Y6I6e+P/7c21M6hd2+G4qWSF5Ton5MmPiw7qtrOzNyJOPRzPkH0Gvasp6D360LCdGBhgmBhg0vP/CbEhWZ7Aae78ldN/21SQExZi5Dovv3BQkge2KoQGSFlV01Zir5fRinAO3Nf1Ss4fdaI7RT0ZHLCqgu0fkZHw+vIN+TODXb1/lQgq9zYBONHKHN2/d9Rf4egnczE2xwqkszvFPNVBE9ZATLrNu4tvk7m67u1vJwcsKwpYpP+lyabu9efJInciJJvMrWz4oAQSY22OAFAAUGR4YBt9t7j3VWJ8qB0BuFEOVllSYhhZBxEvjtqbwNWmMbjaT8nqZYbTKwAd5vbjdQaiyX/thZMGfPjL6pxVg9Ki+UIhKZMJnKfqcuKlDSwFxfVHaLzYuSuKzXNm+8LS+mqkd4FhAa4PcNnoSqdB/WY7e3xf9vJHm8zPv7fhjsfuOO2DDm4H14/9x02P/jx/b3ZF9pjMpB4BJ6gKNu8pgRjF+xsgsD+nkl1x7uBzSLy7yf385evzPv56yYGl8HNS3S/ovfn8Qvygj4YHTpU1zfk0hlt4WI+HPsbcraptzsOCDyMV5prOD/uOE7fbRiC7Z83WwrtXbcrfBCs6LH6+jrQTymMEjf/hvKobUhLDiiDmQCSSPbqd3ArXS0lqzijZC3zkkMTrcgprXiwqa9gdESb7tUguk9UVs8DKZwxJXAixB6yh7ACK+9NkVHVODs9xeZpC1Ni0u3hhbmHtPlqZvHmCdxJp1QR87A/cEg8TEk6bJqOTI+Ae3kZdLdW/3mjQRbtxUFFFxKE4dWPyZqWhxDniHmo7wvigcwu1Ue5dR1xmLZ5ZC38yu93X17VojZt595zx5ZbdxQkAJZixdToDz0oKkRW6nWar1xWznCbS4B9XZXPOSAukJCWSAErxVr6rEONhHpH0vK48wfFbn+QIdu7EfiRibPnwyguG3JueGpWl/k5iuu6qC4Y8uvdI5aKeAqiNO4vYMQIYngSRXgThOb3iw0yP3Hbql53ArK616pm319+CdoNVFGl/4KIAh897Z47lZnySDvjib7N5XyBpLszYeaBsJyzvBr2kiVEQ83fsLyOO20p91sCmnprGYMzyFObiMzjWttTM+cfysfGxIWwwgW1ZZRMzdSP+8YQwEqBEA7A452jNfLyMvANMRxHPoHP5rNcpcW5Gkl9TPrErSl2V61Ktdao/E2TsuOjgsb0Twy7EwLd18HGyd9gGXS1YJWDORdxTcHf1H5LDMsX+aEIbHStr4DqKwwXVvBw5Wg1v8VYSa0s6iTnBpn7M7kwtA3CCiwZiHiFaoQ0QQA3Ry2DQ9es8adtKD+VVmeHgeQyWIB+yoRKotZ51/eeDfvrtiHvOJHB68Y/cfuo76hbh4GLR300+WjXxbIDDFecN5tyBvAFGx6BxFExY3AuTVrE8efPh4gtUSJCBnc6zU9jZix9u/LP7OdOnDJyXlR77JPW9pSf6d82Wo9wBWO4rO7cQ/33OpC+p/p3Swzz22uoLyqubLACNPdkV/P0evHkC+/yFi/kW6mgXqBjga+bLKkrP0COtjmqIMmq0K/oL/QSuDlzbtRdnEodq7rLfiCvcXFrZ9CaNsTfxn/pkkfs5yXGhieNH9Loe26HblHhYuMOg+AWgJIUL0izwuaEVO7ug5nGqbDNCELjbgOIPpXP4Rjm9y9EY4IQy0+NGDBkQO51b5HTOZtYxRSSDoo7OpxXnIyt3p7cqPk/2jronNbxF+Y+G3r6/7MHa+rYGmKHVFL6+FJ2SN4r9B9LBor3wjtCxQTmOAvEWAFNS2bRPQ3E9EZyB7JjZxM+DpSc5LozlFdZy58PC4nruHRwbGTShk5K9omkfPPG5v5iPuoybH//ljPU7juV+sGjXQ1aNQMZLJg+8bdIpfbIO5FYpebzklNF4Dx8yJuAEI+LiLj1nEBczIBZBV+FaoFTGaDltVG9HLitfwA+cAXFNLGtgHPtlTc5e4tTedW9/4lCuOtFFW4vQztv2lWKy8gwc+cdq2cxLsi45bVTKDPdzf1p9ZMGSdbmbAcS5dB7a4utXZ7BZl3Z0hTvEF7AaHr/n7f1pwQ+AxRDcJsAforF7u6oW64mje1PdMjk3D/G5K9q+r/RjEutnl1c1z6YFcfbLH2++gqSWQvfzbrlixOuIAgDny/WrbXLpOR2Uq6kxgLOg5r2HK24+59S+/0LGAYeI1ymgWLbyqTR5XN8Pc4/Wfo/Bg/twcU1JFwwdUmpSxKy4qOChsFzI4S8kQkKUkyRF96TkjQLA2CRuUSssaSg5kFM5H1yaOkl8s6QpmT0Z+0NFOycHJYe6YDDDSqq2PVhiep8NIwcn/KnDyhQflklNOWjjruJDEIcAThhUMPkCrJCQDe+fnhqT2r9PVCdHT+J6V2JgtsiK+C77GVj0tzfWTFu5MX/LOcT67z5cXvXPf227857rxnZKUvf4HRMX79j/TZrsfGjiHu6IGIiPCvZ5UA4dEMd9unAPd3EA+sB4JeXPp4v3sJYGi08WIYyh/ilwXo3kbgk0me6ePL7vzJAgY4eQHZ0k+R2gYL0DdwxrMBwZ+6dGRTx064ROmSlooufNfX7F7fBzmjgqhd10+Qi4QmjeE4kL1247SnMoldVI3gEacX4AR4i5CKVy3wwEi/2UCWl8HD33/gYWFR4En0NWXdvqEQQIROMRGjNiSAJPBPDOl9tgmLnnhb9O/s6Nuw4njux+GjMvxfaLcc095gcOSuq6ACDAih7Or/niWFnjYYQi6JQk+a5Ftu7pHVwUGoy4o6hThiU/CuRWY/4kxZyKUJiUpPDXWhVTssXmHmvn5J64AlZJZrfzYNmtyJKgU8RJNYunt2J1AbP/RDp91WLZwL16zbx91FAD4loWafXL5VMz5iH6H4HCowcncr8V6Ph6JYZxkNuws4idPaGvZsaBg7mVPwDQJcfWYVIXik6LfcOu4l/T+0bxvkUc1Vv/2v4OcUrb3M+l3/rOvXH8c0hMJ1turTwOTafv3rzvlRDGRQ3obFwLsjYAnGBAaFUswb4QdHHIWzYiI4EFk7hXXN7Y/ubn2276I/oW/RBM/YH6Qmx6+p4zFxHwdtI/XDnnu+k457VHprBPnpvmEZy48SMqiK3bdowdyK3koSpdLcToA3CkIzMSefweQmTc2xXgCXBS6/vz6iMK8Hu+Maz5PKsqiYWrNuWzNFoA1m4v/L6wpP6g+7nXThv6XHJ8aBAWzzakW/IxNtOnffG6LnIIDACD2NiZOAhwccbvSY5dPVTRTwUsmNEnT0id1zspPLZZcfiENauZVt2kuNAXggONYZhwaiCwA5BU8c6i6p6IA6PGJK7h9/yiup+wcnNwcqQS7rrwvf+sdkeGg/8E4T1Q78AAOYcQT6/MMyMEsz2HK45t3Fn0nYb17PI5N4y7EYYDiD4Q1SDyQF8HjuFP5w2+ikSuq92vI45scc7R2jL4KEERD91VVyEjALHYqKAkq8JhwmMeq/Ezb627Quv8qy4Y/OA5p/YbCG4BYTQQ6Vta2r2BCUaszxpZNatq96ylcs5s6E4RIvT5j3v/dSivantP9it0crsOlrP42GAukt1+9ahbRg1JmOJ6DjjLZ99ZfzMt7rs3/d8N7KoLh3i9L9wswG3/tuUoCwowdtlOzS3m4gnDU3zepQguNcs35LGjRXXcANFVe0LfCLcWGKbGZibyVEo/rMx+oLOkZTBcOy3zETAj0AcGBvjJD8obB6WOEXiG5h6t2bQ/p/I7xPBw651e17HgmEHJeGDQc0sM5PKzx6cugM5F4qs1t0TFJ8SEzG1W4q1cMxVYVH8nRe+kmrTBPew9UnmDw6vd7twSy1vBrNNJjP0ndyLCe8HQgJUFuYDKK5u5eAf9Ejip+R9svEvruodvnfDBzOlZb4UEm0Zib1K6jzE0yDjs5suHvzbv3jO/0Lrm9U+33gElcwndH9Yhu83OfGJEFABHXWFhWr/9WN6ni/c+o3XqU7NPX4K+hCUP3sX4H9C19Qai1mlUxvlYxnTXCg2dClwzkEsJpm5w8s+/v/GqnuzXJWtzeapm9OXwjITEe64b826netW3Fo4fnrxh0WuXnkLj3qf3J2khPZY4SXA7iCeEFOPJQHDKsF5Thg+K97Vdx0WEBYTnU52/WX6IhYSYupQoAFIQGcGx7zhQRuJzA3v1k80/0aJ6wP3cK87NeDg9NTocIravbj/+2y6J3gKBjFv3lt6VmR43AxHybWbnRgvaOikdHzQTR6dcunVvSRatZnvwoknxYR8BxFqVeDs7MmQyycXniYrOrmTPlFhAsBEi5kdV1c1HkJPmeFLL2ntCO9oNAuBGIJ9OTAg7lFfNuUy1D6GP2bS7pOTVhVvuu3fm2Ffcrx2TmXgHCgFZJa4JCzF53K/9va93/nXZhvxisPmw4HG9FS0S3XHF0CviGriQVz/e8sTUU9NmJcSGpLiJemlzbxz3wLx3fn8BgIAUu/ExIV3dFnVe181mg0xS7evJ0LUhlGZAajRDulxE8K/amJ/946rst6adlX6nv/sU43DTrmIeg0eLbuDf55z5i9Z5SD9CZV93VVsBJv3Z0O8h6wYCw80aYhNEsMSYkPe6We/z6bolPIC/zep1P0Mo3hF0nkEiOepgMtWzJety7s4aGLeiA9gYdPrrp2c9/+irq+8AF+sXDqoTF+SpENiAi6IVuWTL3pJnwBrq9S7ZDvTO3OKOpHZ6ief0QRjKxZPTv8CKGxigHxYZGnABzNM2xZ2Ac00W1Wqn6qHk47hPdX1re05h9V1QtEs+cn3uHODJsI0j0qxk9Ivm7djK82fJgAw2HQPwpY82vfrFz/te9XQ9iYixXYHToqWH3nru3Q0vIGGfzJ3aeaqV7tgF1E2/0PZBJCI2kghOIKSZ3nXWpcPm08rdH7FmMKvLoqTfloH27poz1JNhKUTCRRxISQxnBPxzCNyb/N2f4Iajo4LYKBJ9ZkwdlE7cw0gPpx5PrpcWAKCax9/Pm7TyIGBfw1GgJoDFPDkuhM8jZDVYtbFgZV5RXScu6qJJA27PSo+NKSyt85cOyt6tAlaTVo0nSiobG5DPR+caAuOShkXVR4HNriJxY2xm8tALzug/g855Ei4E8m4VdgcYOfI8OcJaZFEPYmNuYe1Djc3tLUajwbGth09F2Zevh0U7rcGnKesgTQuscBmOXDzO+HpsFRUXGcTe+HQrMlbO7q6v1s+/HXng5Y833RWsZFWEiIO+gj+KW9CpzoMx17E7Pc9lBS6YyTmJfl59ZP0va3Le13ru/LmTFyMcCO4OMDMHygkAeyqkRPKw1ujUH2FVHDYonvVOCOe6H4hJRWUNba9+smVmF/0ndXP+SKp6BJwCxr/NZv8j1kDdHzyODerLAiTBYCCmEcHQcCR98UNttcQNlw5fEBURFOYngPK9QOGMXVtgiVq37dgdUOTx9MAAo075opxcFC6G/9KYzKRvA4z6GdAnqYnoOoCSzenECYBCat6yysbCwpL6l/FcXMP33/O1KJO8h/0ytXKbGj0Na4i1UOTCGmp28U/COwdSeyJQdPWWo2+++dm2gdv2lX5I5zd0IdK0rd9R9Nn89zdmLv0970UeQR8s72QDPxtYwzTe3dDVpFMnHpMkR2AyFKOvfLz5jvLqplr3iwakRg2Zfd2YJ6FLq61vUxcDf6gWjBrA4QkEHIAIa1ZqcgQyHHAlM9oY3//v1wPfbt9fusnbu/s4f3SuYp46fv1MAT0IUPrujmMYvHonhrGRQxJYWu8INmVCXzAOq/ZmV250v4h+u+yJOyc+7hcdlO442AsE127eU/L5qCGJ91OFR8KrmcfpuftEKc6esCZhsCBZGVLlAolN1NZ2nbw7i43O1UNB65K9gG/MQJ1fUFJ3ozzhdN2Lt+Ojh0aevkcXNjxmvAYglXqaBRC9EJ4DMIHDo9FF+anGG0KPUl7VlL1kbc5N2Uer7w8JMo0jwOk3ZmhiJNpz066ieoNBn7v3cPnWvUcqKxA3iXw90FXYlCR/ajiJhu7pByojNKpX4mrVs9itSmZHiffZrkMVlmW/5w+8ZtrQZPfXuvScgYGf/bhP3pbewhXt2DV59YmqeKi4ywnFHuqe5woYWAyRexsLaXSElbcpfK5+XJV9Jo3ZDI0+LPdQh60enpetceywh3OPl7RkpO1+ekaOxrGzNECxzKlDlRc96EvRzzCIIJJh18GyKZnpse651U2Tx6U2+wWgJJ3UYVskn+DXoOcAtHrr0ZtHZMRvQ8iJ1ercrsoRm6fcG6b0xSuzuXIYkw+BoAgsxg4islOmDEyqkhyTLMRkRDrbdVW1rcvBRtu7o0iy/6EWu/3dklHkLZUU0VPyqHyFB38k34TUVltaUbMUOp60XhGcI121uYAN6BPNPbjh1GiURYxOojtPjaJh7FKK1zZUN4y0WuV8XtSdyDvVKfcUgIC/k82RGqVKKf4m6KV2dd2+Tv2Q6mKhNgItom3erneXyrtxfms373081NSDzzjoddwq+wBalA1OeH5/o+6E6uSVJVQHturP56vZHpt67suu2L5hV9EirFZqGgdHbJ5OznwAlwTsFAJHL3BSmDhAX+ydp7oTWF1EPYvijAPv8+KyhutUDo9vp+5Lsav6Jzv7I+S742K77L5lX8AZAAaAFURCddNTAD44JHXDh556Q9cwIb3iVtL1GJJOqnZ23zbNoNcxQf4fIz2rVLPLKuXuABQKBiwAZ8X6/NvhBwNTq87VedMg8QmF6Ptl6/McO6gAgRHMiMGOz6rVTtU/WZQ81GVVTQsams35BmVXWZ//HOdKYvQIEnSSkw9blsgrMFf22bsTOmLjVqKcY7VVy9bnzwOnpHdx3gSyQpyDc9dvWwo5B2BRNsmEKACwcoS2uCgaAZRNzea2ypqm+wx6XbetjGraVAFPggT9LwCUYpO3q+xaNx2MkPnv37/nPp59tLoaLvQ6JW+5LM4x9v3yQzxEg4e5KGBkljcL4OKKmixOTbOCaypqWu5tt9haDIbusuRSB98nQYIE/bcDlJOR6qi38cHRCKcFB5r4jiU/rjpyJ6w90C9B5kfA6YqN+WzTrhKmJpWT4+cUUc5iUzIcMNZutfJjqEV9k7mwvrHtHT1Pzu97vJ1c7CejykmQIEEnClDqvDbqZc7GPeGVp6JXot/Xbi38atOu4h2IUkd4BWKTvvx5Pw/yhcjFsxUovk88+ZpF3jFW1kvZFODiSeOv4RXXyxsl+FwkgUyCBP3PApTKR9mULJjdKXpFkb1o6cHrYdqFY9y3yw4h5Qc3lbdbXLYrtzmtdxD95G3R5dCKppb2ZcRZrcUxx47HvhRJTvUib+ckgEqQoP9JgFLFPJvNZYcDHwq8trGH/NZ9pXu27Cn5GtHMAKjEuFBlHzenOwH38IaoZ5W5KBDSSUAv1dpmmYXvNkUU9LkozxAkSNB/F3Uz5MDpzyJ1kxNBNuTI0AA4ZN6yclN+cFOrxZgcH9JhrzpZR2TnjplqyhRml90OiH40t1uKDHp9t8EGZ+uFZlyQoP86kgRnIUiQoP8JEU+QIEGCBEAJEiRIkAAoQYIECYASJEiQIAFQggQJEgAlSJAgQQKgBAkSJABKkCBBggRACRIkSJAAKEGCBAmAEiRIkCABUIIECRIAJUiQIEECoAQJEiRIAJQgQYIEQAkSJEiQ3+n/BRgAoYjmvY/dw9wAAAAASUVORK5CYII=`;

const appsMenu = `<svg viewBox="0 0 512 512"><path d="M186.2,139.6h139.6V0H186.2V139.6z M372.4,0v139.6H512V0H372.4z M0,139.6h139.6V0H0V139.6z M186.2,325.8h139.6V186.2H186.2 V325.8z M372.4,325.8H512V186.2H372.4V325.8z M0,325.8h139.6V186.2H0V325.8z M186.2,512h139.6V372.4H186.2V512z M372.4,512H512 V372.4H372.4V512z M0,512h139.6V372.4H0V512z"/></svg>`;
const hamburgerMenu = `<svg viewBox="0 0 24 24"><path d="M24 6h-24v-4h24v4zm0 4h-24v4h24v-4zm0 8h-24v4h24v-4z"/></svg>`;

const headerCss = "*{-webkit-box-sizing:border-box;box-sizing:border-box}:host{position:fixed;display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;-ms-flex-align:center;align-items:center;-ms-flex-pack:start;justify-content:flex-start;padding:0;top:0;left:0;right:0;height:var(--header-height);background-color:var(--panel-primary-color);z-index:1000;fill:white;color:white}.flex{display:-ms-flexbox;display:flex}.flex.center{-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center}.header-item{height:100%;cursor:pointer}.header-item.square{width:var(--header-height)}.header-item:hover{background-color:var(--panel-hover-color)}.header-item.open{background-color:var(--panel-selected-color)}.header-item svg{height:40%;width:40%}.logo img{height:var(--footer-height);max-height:var(--footer-height)}.page-title{text-transform:uppercase;font-size:1.1rem;font-weight:500;padding:0 2px}.item-group{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;height:100%;-ms-flex-align:center;align-items:center}.separator{height:var(--footer-height);width:1px;margin:0 5px}.separator.wide{margin:0 10px}.separator.x-wide{margin:0 20px}.separator.line{background-color:#AAA}.separator.grow{-ms-flex-positive:1;flex-grow:1}";

const Header = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.sideMenuOpen = index.createEvent(this, "sideMenuOpen", 7);
        this.sideMenu = false;
        this.logoHref = 'https://www.tokenizer.cc';
        this.apps = [];
        this.isAppsMenuOpen = false;
        this.isSideMenuOpen = false;
    }
    componentWillLoad() {
        if (this.apps.length === 0) {
            fetch('https://cms.tokenizer.cc/tiles')
                .then((response) => response.json())
                .then((response) => {
                this.apps = response.filter(({ active }) => active).map(tile => ({
                    title: tile.title,
                    description: tile.description,
                    logo: `https://cms.tokenizer.cc${tile.icon.url}`,
                    logoAlt: tile.icon.alternativeText,
                    url: tile.url,
                }));
            });
        }
    }
    closeHandler() {
        this.isAppsMenuOpen = false;
    }
    appsMenuClickHandler() {
        this.isAppsMenuOpen = !this.isAppsMenuOpen;
    }
    sideMenuClickHandler() {
        this.isSideMenuOpen = !this.isSideMenuOpen;
        this.sideMenuOpen.emit(this.isSideMenuOpen);
    }
    render() {
        const appMenu = this.isAppsMenuOpen && (index.h("tok-apps-menu", { apps: this.apps }));
        const appMenuButton = (index.h("div", { class: {
                'flex center header-item square apps-menu': true,
                open: this.isAppsMenuOpen,
            }, innerHTML: appsMenu, onClick: this.appsMenuClickHandler.bind(this) }));
        const hamburgerMenuButton = this.sideMenu && (index.h("div", { class: {
                'flex center header-item square side-menu': true,
                open: this.isSideMenuOpen,
            }, innerHTML: hamburgerMenu, onClick: this.sideMenuClickHandler.bind(this) }));
        return (index.h(index.Host, null, appMenuButton, index.h("a", { class: 'flex center header-item logo', href: this.logoHref }, index.h("img", { src: `data:image/png;base64,${logo}` })), this.pageTitle && (index.h("div", { class: 'item-group' }, index.h("div", { class: 'separator wide line' }), index.h("div", { class: 'page-title' }, this.pageTitle))), index.h("div", { class: 'separator grow' }), hamburgerMenuButton, appMenu));
    }
    static get assetsDirs() { return ["assets"]; }
};
Header.style = headerCss;

exports.tok_header = Header;
